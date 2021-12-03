const jwt = require('jsonwebtoken')
const shortid = require('shortid')
const secretKey = 'someRandomString'

let generateToken = (data,cb)=>{
    try{
        let claims = {
            jwtid : shortid.generate(),
            iat : Date.now(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
            sub: 'authToken',
            iss: 'edChat',
            data: data
        }
        let tokenDetails = {
            token : jwt.sign(claims,secretKey),
            tokenSecret : secretKey
        }
        cb(null,tokenDetails)
    }catch(err){
        console.log(err)
        cb(err,null)
    }
}

let verifyToken = (token,secrectKey,cb)=>{
    jwt.verify(token,secrectKey),(err,decode)=>{
        if(err){
            console.log('error while verifying token')
            console.log(err)
            cb(err,null)

        }else{
            console.log('user verified')
            console.log(decode)
            cb(null,decode)
        }
    }
}
let verifyClaimWithoutSecret=(token,cb)=>{
    jwt.verify(token,secretKey,(err,decode)=>{
        if(err){
            console.log("error while verify token")
            console.log(err)
            cb(err,null)
        }
        else{
            console.log('user verified')
            console.log(decode)
            cb(null,decode)
        }
    })
}
module.exports={
    generateToken : generateToken,
    verifyToken:verifyToken,
    verifyClaimWithoutSecret:verifyClaimWithoutSecret
}