const mongoose = require('mongoose')
const Schema = mongoose.Schema
const time = require('../libraries/time')

const Auth = new Schema({
    userId : {
        type : String
    },
    authToken : {
        type : String
    },
    tokenSecret : {
        type : String
    },
    tokenGenerationTime:{
        type:Date,
        default : time.now()
    }
})
 mongoose.model('Auth',Auth)