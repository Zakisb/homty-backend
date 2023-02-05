const router = require('express').Router();
const Property = require('./properties.models');
const mongoose = require('mongoose');
const User = require('../users/users.models');
const multer = require("multer");
const path = require('path');
const Room = require('../rooms/rooms.models');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.resolve(__dirname, '..', 'images/properties'))
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + file.originalname);
	},
});
const upload = multer({ storage: storage});

router.get('/', async (req, res) => {
	try {
		const propertiesList = await User.aggregate([
			{$match: {email: req.query.userEmail}},
			{
				$lookup: {
					from: Property.collection.name,
					localField: "properties",
					foreignField: "_id",
					as: "properties",
				},
			},
			{"$unwind": "$properties" },
			{$match: {"properties.deleted": false}},
			{
				$lookup: {
					from: Room.collection.name,
					localField: "properties.rooms",
					foreignField: "_id",
					as: "rooms",
				},
			},
			{
				$project: {
					_id:null,
					property: "$properties",
					rooms: "$rooms",
				},
			},
		]);
		res.send(propertiesList)
	} catch (err) {
		res.status(400).send(err);
	}
});

router.post('/create',  async (req, res) => {
	const property = new Property({
		type: '',
		address: '',
		surface: '',
		commonSpaces: '',
		images: []
	});

	try {
		const savePropery = await property.save();
		const propertyOwner = await User.updateOne(
			{email: req.body.email},
			{$push: {properties: savePropery._id}}
		);
		res.send(savePropery);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.patch('/:id', upload.array("images"), async (req, res) => {

	const images = req.files.map(function(item) {
		return item.filename
	})

	try {
		const property = await Property.findByIdAndUpdate(req.params.id, {
			type: req.body.type,
			address: req.body.address,
			surface: req.body.surface,
			commonSpaces: req.body.commonSpaces,
			images: images
		}, { new: true });
		if (!property) {
			return res.status(404).send();
		}
		res.send(true);
	} catch (err) {
		console.log(err)
		res.status(400).send(err);
	}
});

router.get('/:id', async (req, res) => {
	try {
		const property = await Property.findOne({ _id:  mongoose.Types.ObjectId(req.params.id)});
		res.send(property);
	} catch (err) {
		res.status(400).send(err);
	}
});


router.patch('/title-description/:id', async (req, res) => {
	console.log(req.body)

	try {
		const property = await Property.findByIdAndUpdate(req.params.id, {
			title: req.body.title,
			description: req.body.description,
		}, { new: true });
		res.send(property);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.delete('/:id',async (req, res) => {
	try {
		const deleteProperty= await Property.findOneAndUpdate({_id:  mongoose.Types.ObjectId(req.params.id)}, { deleted: true } );
		res.send(deleteProperty)
	} catch (err) {
		console.log(err)
		res.status(400).send(err);
	}
});

module.exports = router;
