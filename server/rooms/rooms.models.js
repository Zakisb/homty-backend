const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
	title: {
		type: String
	},
	price: {
		type: Number
	},
	surface: {
		type: Number
	},
	availabilityDate: {
		type: Date
	},
	isAvailable:{
		default: true,
		type: Boolean
	},
	amenities: [],
	keywords: [],
	images: [],
	deleted: {
		default: false,
		type: Boolean
	}
});
module.exports = mongoose.model('Room', roomSchema);