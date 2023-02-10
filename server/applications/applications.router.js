const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../users/users.models');
const Room = require('../rooms/rooms.models');
const multer = require('multer');
const path = require('path');
const Application = require('./applications.models');
const Property = require('../properties/properties.models');

router.get('/', async (req, res) => {
	try {
		const findApplicatId = await User.findOne({ email: req.query.applicantEmail });
		const findApplicatiom = await Application.findOne({
			applicantId: mongoose.Types.ObjectId(findApplicatId._id),
			roomId: mongoose.Types.ObjectId(req.query.roomId)
		});
		console.log(findApplicatiom);
		res.send(findApplicatiom);
	} catch (err) {
		console.log(err);
	}
});

router.get('/:email', async (req, res) => {

	try {
		/*	const property = await Property.findOne({ _id:  mongoose.Types.ObjectId(req.params.id)});*/
		const ownerId = await User.findOne({ email: req.params.email });
		const property = await Application.aggregate([
			{ $match: { ownerId: mongoose.Types.ObjectId(ownerId._id) } },
			{
				$lookup: {
					from: Property.collection.name,
					localField: 'propertyId',
					foreignField: '_id',
					as: 'property'
				}
			},
			{
				$lookup: {
					from: Room.collection.name,
					localField: 'roomId',
					foreignField: '_id',
					as: 'room'
				}
			},
			{
				$lookup: {
					from: User.collection.name,
					localField: 'applicantId',
					foreignField: '_id',
					as: 'applicant'
				}
			},
			{ $unwind: '$property' },
			{ $unwind: '$room' },
			{ $unwind: '$applicant' }
		]);
		res.send(property);
	} catch (err) {
		res.status(400).send(err);
	}

});

router.post('/', async (req, res) => {

	try {
		const findApplicatId = await User.findOne({ email: req.body.userEmail });
		const application = new Application({
			applicantId: mongoose.Types.ObjectId(findApplicatId._id),
			roomId: mongoose.Types.ObjectId(req.body.roomId),
			ownerId: mongoose.Types.ObjectId(req.body.ownerId),
			propertyId: mongoose.Types.ObjectId(req.body.propertyId),
			applicationPrice: req.body.applicationPrice,
			applicationStatus: 'Pending',
			applicationStatusHistory: [{ Status: 'Pending', Date: new Date() }]
		});
		const saveApplication = await application.save();
		res.send(saveApplication);
	} catch (err) {
		console.log(err);
	}
});

router.patch('/:id', async (req, res) => {
	try {
		const application = await Application.findByIdAndUpdate(req.params.id, {
			applicationStatus: req.body.status,
			$push: { applicationStatusHistory: { Status: req.body.status, Date: new Date() } }
		}, { new: true });
		/*if (!application) {
			return res.status(404).send();
		}*/
		res.send(application);
	} catch (err) {
		console.log(err);
		res.status(400).send(err);
	}
});

router.patch('/title-description/:id', async (req, res) => {

	/*try {
		const property = await Property.findByIdAndUpdate(req.params.id, {
			title: req.body.title,
			description: req.body.description,
		}, { new: true });
		res.send(property);
	} catch (err) {
		res.status(400).send(err);
	}*/
});

module.exports = router;
