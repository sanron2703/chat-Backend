
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

let userSchema = new Schema({
  userId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    default: 'pk'
  },
  email: {
    type: String,
    default: ''
  },
  mobileNumber: {
    type: Number,
    default: 0
  },
  createdOn :{
    type:Date,
    default:""
  }


})


mongoose.model('User', userSchema);