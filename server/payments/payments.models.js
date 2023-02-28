const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
	uuid: {
		type: String,
		required: true,
		unique: true
	},
	landlordId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	propertyId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Property'
	},
	paymentType: {
		type: String
	},
	paymentAmount:{
		type: Number,
		required: true
	},
	paymentCategory: {
		type: String,
		enum: ['rent', 'electricity', 'repairs', 'other'],
		required: true
	},
	paymentMethod: {
		type: String,
		enum: ['bank transfer', 'credit card', 'other'],
		required: true
	},
	paymentDate:{
		type: Date,
		default: new Date()
	},
	paymentDescription:{
		type: String,
	},
	deleted: {
		default: false,
		type: Boolean
	},
	documentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Document'
	}
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = { Payment };


