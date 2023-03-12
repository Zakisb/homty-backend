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
  personalDocuments: [{
    type: Object,
    default: {}
  }],
  garantDocuments: [{
    type: Object,
    default: {}
  }],
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
}, { toJSON: { virtuals: true } });

userSchema.virtual('isVerified').get(function() {
  const requiredDocs = ['personalId', 'paySlipCertificate', 'garantieVisale'];
  for (let i = 0; i < requiredDocs.length; i++) {
    const docType = requiredDocs[i];
    const docExists = this.personalDocuments.some(doc => doc.documentType === docType);
    if (!docExists) {
      return false;
    }
  }

  return true;
});

module.exports = mongoose.model("User", userSchema);

