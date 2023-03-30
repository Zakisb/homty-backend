const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const User = require('../users/users.models');
const { Payment } = require('./payments.models');
const randomstring = require("randomstring");
const mongoose = require('mongoose');
const { Document, Property } = require('../properties/properties.models');
const Room = require('../rooms/rooms.models');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './server/documents/payments');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + file.originalname);
	}
});
const upload = multer({ storage: storage });

async function createPayment(paymentData) {
	let payment;
	let isUnique = false;
	while (!isUnique) {
		// generate a new UUID for the payment
		const uuid = randomstring.generate({
			length:7,
			charset: 'alphanumeric',
			capitalization: 'uppercase'
		});
		// check if a payment with this UUID already exists
		payment = await Payment.findOne({ uuid });

		if (!payment) {
			// create the payment with the unique UUID
			payment = new Payment({ ...paymentData._doc, uuid });
			await payment.save();

			isUnique = true;
		}
	}

	return payment;
}

router.post('/', upload.array('paymentDocuments'), async (req, res) => {

	try {
		const findUser = await User.findOne({ email: req.body.landlordEmail });

		const document = new Document({
			documentTitle: req.body.paymentType,
			documentType: req.body.paymentCategory,
			filename: req.files[0].filename,
			originalname: req.files[0].originalname,
			note: req.body.paymentDescription,
		});

		const saveDocument = await document.save();

		// Create a new payment object with the required fields
		const payment = new Payment({
			landlordId: req.body.ownerId ? req.body.ownerId : findUser._id,
			propertyId: req.body.propertyId,
			paymentType: req.body.paymentType,
			paymentAmount: parseInt(req.body.paymentAmount),
			paymentCategory: req.body.paymentCategory,
			paymentMethod: req.body.paymentMethod,
			paymentDate: req.body.paymentDate,
			paymentDescription: req.body.paymentDescription,
			documentId: saveDocument._id
		});

		const result = await createPayment(payment);
		res.status(201).json(result);
	} catch (err) {
		console.log(err);
		res.status(400).send(err);
	}
});

router.get('/', upload.array('paymentDocuments'), async (req, res) => {

	try {
		// Find user
		const findUser = await User.findOne({ email: req.query.userEmail });
		// Get payments list
		const paymentsList = await Payment.aggregate([
			{$match: {landlordId: mongoose.Types.ObjectId(findUser._id)}},
			{
				$lookup: {
					from: Property.collection.name,
					localField: "propertyId",
					foreignField: "_id",
					as: "property",
				},
			},
			{"$unwind": "$property"},
			{
				$lookup: {
					from: Document.collection.name,
					localField: "documentId",
					foreignField: "_id",
					as: "document",
				},
			},
			{"$unwind": "$document"},
			{
				$group: {
					_id: "$property._id",
					propertyTitle: {
						$first: "$property.title"
					},
					subRows: {
						$push: {
							_id: "$_id",
							paymentDate: "$paymentDate",
							deleted: "$deleted",
							paymentType: "$paymentType",
							paymentAmount:  {
								$cond: [
									{ $eq: ["$paymentType", "expense"] },
									{ $multiply: ["$paymentAmount", -1] },
									"$paymentAmount"
								]
							},
							paymentCategory: "$paymentCategory",
							paymentMethod: "$paymentMethod",
							paymentDescription: "$paymentDescription",
							paymentDocument: "$document",
							uuid: "$uuid",
						}
					},
				}
			},
			{
				$project: {
					_id: 1,
					propertyTitle: 1,
					subRows: 1,
					total: {
						$sum: "$subRows.paymentAmount"
					}
				}
			}
		]);
		res.status(201).send(paymentsList);
	} catch (err) {
		console.log(err);
		res.status(400).send(err);
	}
});

module.exports = router;
