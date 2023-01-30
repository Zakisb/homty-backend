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
    communSpaces: {
        type: Array,
    },
    images: [],
    deleted: {
        default: false,
        type:Boolean
    },
    rooms:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Properties",
        },
    ],
});
module.exports = mongoose.model("Property", propertySchema);