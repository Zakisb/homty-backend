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
  personalInformations: {
    type: Object,
    default: {}
  },
  livingPreferences: {
    type: Object,
    default: {}
  },
  personnalityTraits: {
    type: Object,
    default: {}
  },
  passionsList: {
    type: Array,
    default: []
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
  properties:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
  }],
  googleId:{
    type:String
  },
  facebookId:{
    type:String
  },
  questions: {},
  onBoarded: {
    default:true,
    type: Boolean
  }
});

module.exports = mongoose.model("User", userSchema);

