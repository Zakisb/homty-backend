const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
	applicantId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	ownerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	roomId:  {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Room",
	},
	propertyId:  {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Property",
	},
	applicationDate: {
		type: Date,
		default: new Date(),
	},
	applicationPrice: {
		type: Number,
	},
	applicationStatus: {
		type: String,
	},
	applicationStatusHistory: [],
});

module.exports = mongoose.model("Application", applicationSchema);
