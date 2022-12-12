const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});
module.exports = mongoose.model("Listing", listingSchema);