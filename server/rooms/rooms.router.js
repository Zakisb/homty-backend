const router = require('express').Router();
const mongoose = require('mongoose');
const Room = require('./rooms.models')
const multer = require("multer");
const path = require('path');
const Property = require('../properties/properties.models');
const User = require('../users/users.models');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.resolve(__dirname, '..', 'images/rooms'))
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
			price: JSON.parse(req.body.price).trim(),
			surface: JSON.parse(req.body.surface),
			/*availabilityDate:  new Date(JSON.parse(req.body.availabilityDate)),*/
			desk:   JSON.parse(req.body.desk),
			lighting:   JSON.parse(req.body.lighting),
			storage:  JSON.parse(req.body.storage),
			windows:  JSON.parse(req.body.windows),
			bedding:  JSON.parse(req.body.bedding),
			heating:  JSON.parse(req.body.heating),
			furniture:  JSON.parse(req.body.furniture),
			technology:  JSON.parse(req.body.technology),
			privateBathroom:  JSON.parse(req.body.privateBathroom),
			sharedSpace:  JSON.parse(req.body.sharedSpace),
			images: images
		});

		const saveRoom = await room.save();
		const propertyMother = await Property.updateOne(
			{ _id:  mongoose.Types.ObjectId(req.query.propertyId)},
			{$push: {rooms: saveRoom._id}}
		);

		res.send(propertyMother)

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
	const images = req.files.map(function(item) {
		return item.filename
	})
	for(element in req.body) {
		req.body[element] =  JSON.parse(req.body[element])
	}
	req.body.images = images

	try {
		const updatedDocument = await Room.findOneAndUpdate(
			{ _id:   mongoose.Types.ObjectId(req.params.id) }, // find by _id
			{ $set: req.body }, // data to update
			{ upsert: true, new: true,  } // options - upsert creates new document if not exists, new returns updated document
		);

		res.send(updatedDocument);
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
