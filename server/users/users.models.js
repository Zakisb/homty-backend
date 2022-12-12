const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  tel: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  nom: {
    type: String,
  },
  prenom: {
    type: String,
  },
  adresse: {
    type: String,
  },
  ville: {
    type: String,
  },
  pays: {
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
});

module.exports = mongoose.model("User", userSchema);

