const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libraries/time');
const response = require('./../libraries/responselib')
const logger = require('./../libraries/logger');
const validateInput = require('./../libraries/paramsValidation')
const check = require('./../libraries/check')
const token = require('./../libraries/token')
const genPassword = require('./../libraries/genPassword');
const { promise } = require('bcrypt/promises');

/* Models */
const UserModel = mongoose.model('User')
const AuthModel = mongoose.model('Auth')

//get all blogs
let getAllUsers = (req,res)=>{
    UserModel.find()
    .select('-__v-_id')
    .lean()
    .exec((err,result)=>{
        console.log(err,result,'allb')
        if(err){
            console.log(err)
            logger.error(err.message,'user Controller: Get all blogs',10)
            let apiResponse= response.generate(true,'Failded to find users',500,null)
            res.send(apiResponse)
        }else if(check.isEmpty(result)){
            logger.info('No user found', 'user controller : Get all blogs')
            let apiResponse = response.generate(true,'no user found',404,null)
            res.send(apiResponse)
        }else {
            let apiResponse = response.generate(false,'All users found',200,result)
            console.log(result)
            res.send(apiResponse)
        }
        
    })
}//end get all blogs

//start get single blog
let getSingleUser = (req,res)=>{
    UserModel.findOne({userId: req.params.userId}, (err, result)=>{
        if (err) {
            console.log(err)
            logger.error(err.message, 'User Controller: getSingleUser', 10)
            let apiResponse = response.generate(true, 'Failed To get user details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No User Found', 'User Controller: getSingleUser')
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'User Found', 200, result)
            res.send(apiResponse)
        }
    })
} // end get single user 


//start delete blog
let deleteUser = (req,res)=>{
    UserModel.deleteOne({userId:req.params.userId},(err,result)=>{
        console.log(err,result,'delete')
        if(err){
            console.log(err)
            logger.error(err.message,'user controllor : delete user',10)
            let apiResponse = response.generate(true,'failed to delete user',500,null)
            res.send(apiResponse)
        }else if(check.isEmpty(result)){
            logger.info('no user found: delete user')
            let apiResponse = response.generate(true,'no user found',404,null)
            res.send(apiResponse)
        }else{
            let apiResponse = response.generate(false,'blog deleted succesfully',200,result)
            res.send(apiResponse)
        }
    })
}//end to delete blog

//start edit blog
let editUser = (req,res)=>{
    console.log('edit')
    let option = req.body
    console.log(req.body,'reqbody')
    UserModel.update({userId:req.params.userId},option, {multi: true},(err,result)=>{
        console.log(req.params.userId,'yes')
        console.log(err,result,'edit')
        if (err) {
            console.log(err)
            logger.error(err.message, 'User Controller:editUser', 10)
            let apiResponse = response.generate(true, 'Failed To edit user details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No User Found', 'User Controller: editUser')
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'User details edited', 200, result)
            res.send(apiResponse)
        }
    })
}//end to edit blog


// start user signup function 

let signUpFunction = (req, res) => {
    let validateUserInput =() =>{
        
        return new Promise((resolve,reject)=>{
            if(req.body.email){
                console.log(validateInput)
               if(!validateInput.Email(req.body.email)){
                   let apiResponse = response.generate(true,'Email does not meet the request',400,null)
                   reject(apiResponse)
               } else if(check.isEmpty(req.body.password)){
                   let apiResponse =response.generate(true,'"password" parameter is missing',400,null)
                   reject(apiResponse)
               }else{
                    let apiResponse = response.generate(false,'User Sign-up successfully',200,resolve)
                    resolve(apiResponse)
               }
            }else{
                logger.error('Field missing user creation','user controllor : createUser()',5)
                let apiResponse = response.generate(true,'One of the parameters are missing',400,null)
                reject(apiResponse)
            }
        })
    } //end validate user input
  
    let createUser = () =>{
        return new Promise((resolve,reject)=>{
            UserModel.findOne({email:req.body.email},(err,retrievedUserDetails)=>{
                if(err){
                    console.log(err)
                    logger.error(err.message , 'userContollor : createUser()',10)
                    let apiResponse = response.generate(true,'Failed to create user',500,null)
                    reject(apiResponse)
                }else if(check.isEmpty(retrievedUserDetails)){
                    console.log(req.body)
                    let newUser = new UserModel({
                        userId : shortid.generate(),
                        firstName : req.body.firstName,
                        lastName : req.body.lastName || '',
                        email : req.body.email.toLowerCase(),
                        mobileNumber : req.body.mobileNumber,
                        password : genPassword.hashpassword(req.body.password),
                        createdOn : time.now()
                    })
                    newUser.save((err,newUser)=>{
                        console.log(newUser);
                        if(err){
                            console.log(err)
                            logger.error(err.message , 'userControllor : createUser',10)
                            let apiResponse = response.generate(true,'Failed to create user',500,null)
                            reject(apiResponse)
                        }else{
                            let newUserObj = newUser.toObject()
                            resolve(newUserObj)
                        }
                    })
                }else{
                    logger.error('User already present','userControllor : createUser',5)
                    let apiResponse = response.generate(true,'User already present with this email',403,null)
                    reject(apiResponse)
                }
            })
        }) 
       
    }//end to create user
    
    validateUserInput(req,res)
    .then(createUser)
    .then((resolve)=>{
        delete resolve.password
        let apiResponse = response.generate(false,'user created successfully',200,resolve)
        res.send(apiResponse)
    })
    .catch((err)=>{
        console.log(err)
        res.send(err)
    })
}// end user signup function 

// start of login function 
let loginFunction = (req, res) => {
    let findUser = () =>{
        return new Promise((resolve,reject)=>{
            if(req.body.email){
                console.log(req.body.email,'login email')
                UserModel.findOne({email:req.body.email}, (err,userDetails)=>{
                  if(err){
                      console.log(err)
                      logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                      let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                      reject(apiResponse)
                  }else if(check.isEmpty(userDetails)){
                    logger.error('No User Found', 'userController: findUser()', 7)
                    let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                    reject(apiResponse)
                  }else{
                    logger.info('User Found', 'userController: findUser()', 10)
                    let apiResponse = response.generate(false, 'user log-in successfully',200,userDetails)
                    resolve(apiResponse)
                  }

                })
        
            }else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
            
         })
    }
    let validatePassword =(retrievedUserDetails)=>{
       console.log(retrievedUserDetails,'validate')
        return new Promise((resolve,reject)=>{
            genPassword.comparePassword(req.body.password,retrievedUserDetails.data.password,(err,isMatch)=>{
               console.log(retrievedUserDetails.data.password)
                console.log(isMatch,'valid match')
                if(err){

                    console.log(err,'valid e')
                    logger.error(err.message ,'usercontrollor:ValidatePassword',10)
                    let apiResponse = response.generate(true,'Login failed',500,null)
                    reject(apiResponse)
                 }else if(isMatch){
                    console.log(isMatch,'valid m')
                     let retrievedUserDetailsObj = retrievedUserDetails.data.toObject()
                     delete retrievedUserDetailsObj.password
                     delete retrievedUserDetailsObj._id
                     delete retrievedUserDetailsObj.__v
                     delete retrievedUserDetailsObj.createdOn
                     delete retrievedUserDetailsObj.modifiedOn
                     resolve(retrievedUserDetailsObj)
                 }else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }
    let generateToken = (userDetails)=>{
        console.log(userDetails, 'gen token')
        return new Promise((resolve,reject)=>{
            token.generateToken(userDetails,(err,tokenDetails)=>{
                if(err){
                    console.log(err)
                    let apiResponse = response.generate(true,'Failed to generate token',400,null)
                    reject(apiResponse)
                }else{
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails=userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }
    let saveToken = (tokenDetails)=>{
        console.log(tokenDetails,'sav token')
        return new Promise((resolve,reject)=>{
            AuthModel.findOne({userId:tokenDetails.userId},(err,retrievedTokenDetails)=>{
                console.log(err,'err ret')
                console.log(retrievedTokenDetails,'ret token')
                if (err) {
                    console.log(err.message, 'userController: saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    console.log(newAuthToken,'newauth..')
                    newAuthToken.save((err, newTokenDetails) => {
                        console.log(err,'err newt')
                        console.log(newTokenDetails,'newt')
                      if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            console.log(responseBody,'resp..')
                            resolve(responseBody)
                            
                        }
                    })
                } else {
                        retrievedTokenDetails.authToken = tokenDetails.token
                        retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                        retrievedTokenDetails.tokenGenerationTime = time.now()
                        retrievedTokenDetails.save((err, newTokenDetails) => {
                            console.log(newTokenDetails,'newtde...')
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: saveToken', 10)
                                let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                                reject(apiResponse)
                            } else {
                                let responseBody = {
                                    authToken: newTokenDetails.authToken,
                                    userDetails: tokenDetails.userDetails
                                }
                                console.log(responseBody,'resb...')
                                resolve(responseBody)
                                
                            }
                        })
                    }
            })
        })
    }
    
    findUser(req,res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })
}


// end of the login function 

let logout = (req, res) => {
   
    AuthModel.findOneAndRemove({userId: req.body.userId}, (err, result) => {
        
      if (err) {
          console.log(err)
          logger.error(err.message, 'user Controller: logout', 10)
          let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
          res.send(apiResponse)
      } else if (check.isEmpty(result)) {
          let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
          res.send(apiResponse)
      } else {
          let apiResponse = response.generate(false, 'Logged Out Successfully', 200, result)
          res.send(apiResponse)
      }
    })
  } // end of the logout function.

module.exports = {
    getAllUsers : getAllUsers,
    getSingleUser:getSingleUser,
    editUser:editUser,
    deleteUser:deleteUser,
    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    logout: logout

}