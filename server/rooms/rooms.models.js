const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
	title: {
		type: String
	},
	description: {
		type: String
	},
	price: {
		type: String
	},
	surface: {
		type: String
	},
	availabilityDate: {
		type: Date
	},
	availableSlots: {
		type: String
	},
	desk: [],
	lighting: [],
	images: [],
	storage: [],
	windows: [],
	bedding: [],
	heating: [],
	furniture: [],
	technology: [],
	privateBathroom: [],
	sharedSpace: [],
	deleted: {
		default: false,
		type: Boolean
	}
});
module.exports = mongoose.model('Room', roomSchema);