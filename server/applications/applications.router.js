const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../users/users.models');
const Room = require('../rooms/rooms.models');
const multer = require('multer');
const path = require('path');
const Application = require('./applications.models');
const { Property } = require('../properties/properties.models');



router.get('/', async (req, res) => {
	try {
		const findApplicatId = await User.findOne({ email: req.query.applicantEmail });
		const findApplication = await Application.findOne({
			applicantId: mongoose.Types.ObjectId(findApplicatId._id),
			roomId: mongoose.Types.ObjectId(req.query.roomId)
		});
		if (!findApplication) {
			return res.status(404).json({ message: 'Application not found' });
		}
		res.send(findApplication);
	} catch (err) {
		console.log(err);
	}
});

router.get('/:email', async (req, res) => {
	try {
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
		console.log(err);
		res.status(400).send(err);
	}

});




router.get('/my-applications/:email', async (req, res) => {
	try {
		const applicantId = await User.findOne({ email: req.params.email });
		const property = await Application.aggregate([
			{ $match: { applicantId: mongoose.Types.ObjectId(applicantId._id) } },
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
		console.log(req.body)
		console.log(findApplicatId._id)

		const application = new Application({
			applicantId: mongoose.Types.ObjectId(findApplicatId._id),
			roomId: mongoose.Types.ObjectId(req.body.roomId),
			ownerId: mongoose.Types.ObjectId(req.body.ownerId),
			propertyId: mongoose.Types.ObjectId(req.body.propertyId),
			applicationPrice: req.body.applicationPrice,
			applicationStatusHistory: [{
				title: 'Application sent',
				date: new Date(),
				description: `Application sent by the tenant`,
				applicationStatusLandlord: 'Application Pending',
				applicationStatusTenant: 'Waiting for approval',
				applicationStatus: 'Applied',
			}]
		});
		const saveApplication = await application.save();
		res.send(saveApplication);
	} catch (err) {
		console.log(err);
	}
});

router.patch('/:id', async (req, res) => {
	try {
		const currentApplication = await Application.findById(req.params.id);

		const newMovingDate = req.body.movingDate ? req.body.movingDate : currentApplication.movingDate;
		const newVisiteDate = req.body.visitDate ? req.body.visitDate : currentApplication.visitDate;
		const newRentStartDate = req.body.rentStartDate ? req.body.rentStartDate : currentApplication.rentStartDate;

		const application = await Application.findByIdAndUpdate(req.params.id, {
			movingDate: newMovingDate,
			visitDate: newVisiteDate,
			rentStartDate: newRentStartDate,
			$push: { applicationStatusHistory: req.body.applicationStatusHistory }
		}, { new: true });

		if (!application) {
			return res.status(404).send();
		}
		res.send(application);
	} catch (err) {
		console.log(err);
		res.status(400).send(err);
	}
});

router.get('/rooms-checkin/:applicationId', async (req, res) => {
	try {
		const findApplication = await Application.aggregate([
			{ $match: { _id: mongoose.Types.ObjectId(req.params.applicationId) }},
			{
				$lookup: {
					from: User.collection.name,
					localField: 'ownerId',
					foreignField: '_id',
					as: 'owner'
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
			{ $unwind: '$applicant' },
			{ $unwind: '$owner' },
			{
				$project: {
					_id: 1,
					ownerFullName:{ $concat: [
							"$owner.firstName",
							" ",
							"$owner.lastName"
						]},
					applicantFullName: { $concat: [
							"$applicant.firstName",
							" ",
							"$applicant.lastName"
						]},
					roomsCheckinNotes: 1
				}
			},
		]);
		if (!findApplication) return res.status(404).send({ message: 'Application checking rates not found.' });
		res.send(findApplication[0]);
	} catch (err) {
		console.log(err);
		res.send('Error occured. Please fix your request before trying again');
	}
});

router.patch('/rooms-checkin/:applicationId', async (req, res) => {
	try {
		const application = await Application.findByIdAndUpdate(req.params.applicationId, {
			$push: { applicationStatusHistory: req.body.applicationStatusHistory }
		}, { new: true });

		const roomsChecking = await Application.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.params.applicationId) }, { roomsCheckinNotes: req.body.roomsCheckingRates }, { new: true });
		res.send(roomsChecking);
	} catch (err) {
		console.log(err);
	}
});


module.exports = router;
