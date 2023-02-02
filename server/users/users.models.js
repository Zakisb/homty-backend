const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    unique: true
  },
  email_verified: {
    type:Boolean
  },
  adresse: {
    type: String,
  },
  city: {
    type: String,
  },
  zipcode:{
    type: String,
  },
  country: {
    type: String,
  },
  description: {
    type: String,
  },
  photo: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  properties:{
    type: Array
  },
  googleId:{
    type:String
  },
  facebookId:{
    type:String
  },
  questions: {},
  onBoarded: {
    default:false,
    type: Boolean
  }
});

module.exports = mongoose.model("User", userSchema);

