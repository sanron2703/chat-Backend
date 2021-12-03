const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Auth = mongoose.model('Auth')


const logger = require('../libraries/logger')
const check = require('../libraries/check')
const response = require ('../libraries/responselib')
const token = require('../libraries/token')

let isAuthorized = (req, res, next) => {
  

    if (req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')) {
      Auth.findOne({authToken: req.header('authToken') || req.params.authToken || req.body.authToken || req.query.authToken}, (err, tokenDetails) => {
          console.log(err,'err...')
          console.log(tokenDetails,'auth....')
        if (err) {
          console.log(err)
          logger.error(err.message, 'AuthorizationMiddleware', 10)
          let apiResponse = response.generate(true, 'Failed To Authorized', 500, null)
          res.send(apiResponse)
        } else if (check.isEmpty(tokenDetails)) {
          logger.error('No AuthorizationKey Is Present', 'AuthorizationMiddleware', 10)
          let apiResponse = response.generate(true, 'Invalid Or Expired AuthorizationKey', 404, null)
          res.send(apiResponse)
        } else {
          jwt.verify(tokenDetails.authToken,tokenDetails.tokenSecret,(err,decoded)=>{
  
              if(err){
                  logger.error(err.message, 'Authorization Middleware', 10)
                  let apiResponse = response.generate(true, 'Failed To Authorized', 500, null)
                  res.send(apiResponse)
              }
              else{
                  
                  req.user = {userId: decoded.data.userId}
                  next()
              }
  
  
          });// end verify token
         
        }
      })
    } else {
      logger.error('AuthorizationToken Missing', 'AuthorizationMiddleware', 5)
      let apiResponse = response.generate(true, 'AuthorizationToken Is Missing In Request', 400, null)
      res.send(apiResponse)
    }
  }
  
  
  module.exports = {
    isAuthorized: isAuthorized
  }
  
