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
	visitDate: {
		type:Date
	},
	movingDate: {
		type:Date
	},
	leavingDate: {
		type:Date
	},
	applicationPrice: {
		type: Number,
	},
	applicationStatus: {
		type: String,
	},
	applicationStatusLandlord: {
		type: String,
	},
	applicationStatusTenant: {
		type: String,
	},
	applicationStatusHistory: [],
});

module.exports = mongoose.model("Application", applicationSchema);
