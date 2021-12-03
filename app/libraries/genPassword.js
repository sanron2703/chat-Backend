const bcrypt = require('bcrypt')
const { model } = require('mongoose')
const saltRounds = 10
const logger = require('../libraries/logger')

let hashpassword = (myPassword)=>{
    let salt = bcrypt.genSaltSync(saltRounds)
    let hash = bcrypt.hashSync(myPassword,salt)
    return hash
}

let comparePassword = (oldpassword,hashpassword,cb)=>{
    bcrypt.compare(oldpassword,hashpassword,(err,result)=>{
        if(err){
            logger.error(err.message , 'comparison error',5)
            console.log(err,'no')
            cb(err,null)
        }
        else{
            console.log(result,'yes')
            cb(null,result)
        }
    })
}

let comparePasswordSync = (oldPassword, hashPassword)=>{
    return bcrypt.compareSync(oldPassword, hashPassword)
}

module.exports = {
    hashpassword:hashpassword,
    comparePassword:comparePassword,
    comparePasswordSync:comparePasswordSync

}