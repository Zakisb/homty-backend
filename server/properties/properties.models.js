const mongoose = require("mongoose");


const documentSchema = new mongoose.Schema({
    documentTitle: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    startDate: {
        type:Date
    },
    endDate: {
        type:Date
    },
    documentType:{
        type:String
    },
    price:{
        type:Number
    },
    note: {
        type:String
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
        type: String,
    },
    bedrooms: {
        type: String,
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


