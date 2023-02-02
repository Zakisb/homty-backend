const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    type: {
      type:String
    },
    address: {
        type: String,
    },
    surface: {
        type: String,
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