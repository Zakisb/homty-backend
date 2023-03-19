const mongoose = require("mongoose");


const documentSchema = new mongoose.Schema({
    documentTitle: {
        type: String,
        required: true,
    },
    documentType:{
        type:String
    },
    originalname: {
        type: String,
    },
    filename: {
        type: String,
    },
    note: {
        type:String
    },
    dateAdded: {
        type:Date,
        default: new Date()
    },
    deleted: {
        type:Boolean,
        default:false
    }
});

const Document = mongoose.model('Document', documentSchema);

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    baths: {
        type: Number,
    },
    bedrooms: {
        type: Number,
    },
    type: {
      type:String
    },
    address: {
        type: Object,
    },
    surface: {
        type: Number,
    },
    isValidated: {
        default: false,
        type:Boolean
    },
    commonSpaces: [],
    images: [],
    deleted: {
        default: false,
        type:Boolean
    },
    rooms:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
        },
    ],
    documents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
        },
    ]
});

const Property = mongoose.model("Property", propertySchema);

module.exports = { Property, Document };


