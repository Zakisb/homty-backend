const mongoose = require("mongoose");

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
});
module.exports = mongoose.model("Property", propertySchema);