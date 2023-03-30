const router = require('express').Router();
const mongoose = require('mongoose');
const Room = require('./rooms.models')
const multer = require("multer");
const path = require('path');
const { Property } = require('../properties/properties.models');
const User = require('../users/users.models');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './server/images/rooms')
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + file.originalname);
	},
});
const upload = multer({ storage: storage});


router.post('/',  upload.array('images'), async (req, res) => {

	const images = req.files.map(function(item) {
		return item.filename
	})
	try {
		const room = new Room({
			title: req.body.title,
			surface: req.body.surface,
			price: req.body.price,
			availabilityDate:  new Date(req.body.availabilityDate),
			amenities:   req.body.amenities,
			keywords:  req.body.keywords,
			images: images
		})

		const saveRoom = await room.save();
		const propertyMother = await Property.updateOne(
			{ _id:   mongoose.Types.ObjectId(req.query.propertyID)},
			{$push: {rooms: saveRoom._id}}
		);

		res.send(propertyMother)

	} catch (err) {
		console.log(err)
		res.status(400).send(err);
	}
});

router.get('/:id', async (req, res) => {
	try {
		const room = await Room.findById(mongoose.Types.ObjectId(req.params.id))
		if(!room) return res.status(404).send({message: 'Room not found'})

		res.send(room)
	} catch (err) {
		console.log(err)
		res.status(400).send(err);
	}

});

router.get('/', async (req, res) => {
	try {
		const propertyRoomsList = await Property.aggregate([
			{$match: {_id: mongoose.Types.ObjectId(req.query.propertyId)}},
			{
				$lookup: {
					from: Room.collection.name,
					localField: "rooms",
					foreignField: "_id",
					as: "rooms",
				},
			},
			{ "$unwind": "$rooms" },
			{$match: {"rooms.deleted": false}},
			{ "$group": {
					'_id': '$_id',
					'rooms': { '$push': '$rooms' }
				}
			}
		]);
		res.send(propertyRoomsList)
	} catch (err) {
		res.status(400).send(err);
	}
});

router.patch('/:id', upload.array('images'),async (req, res) => {

	try {
		const uploadedImages = req.files.map(function(item) {
			return item.filename
		})
		const images = [...uploadedImages, ...(Array.isArray(req.body.images) ? req.body.images : [req.body.images])]
		const keywords = req.body.keywords ? req.body.keywords : [];
		const updatedRoom = await Room.findOneAndUpdate(
			{ _id:   mongoose.Types.ObjectId(req.params.id) }, // find by _id
			{... req.body, images: images, keywords: keywords } , // data to update
			{new: true,  } // options - upsert creates new document if not exists, new returns updated document
		);

		res.send(updatedRoom);
	} catch (err) {
		console.log(err)
		res.status(400).send(err);
	}
});

router.delete('/:id',async (req, res) => {
	try {
		const deleteRoom = await Room.findOneAndUpdate({_id:  mongoose.Types.ObjectId(req.params.id)}, { deleted: true } );
		res.send(deleteRoom)
	} catch (err) {
		console.log(err)
		res.status(400).send(err);
	}
});

/*router.get('/:id', async (req, res) => {


});*/

module.exports = router;
