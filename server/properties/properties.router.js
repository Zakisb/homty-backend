const router = require('express').Router();
const { Document, Property } = require('./properties.models');
const mongoose = require('mongoose');
const User = require('../users/users.models');
const multer = require("multer");
const path = require('path');
const Room = require('../rooms/rooms.models');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.resolve(__dirname, '..', 'images/properties'))
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + file.originalname);
	},
});
const upload = multer({ storage: storage});

const documentStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.resolve(__dirname, '..', 'documents/properties'))
	},
	filename: function (req, file, cb) {
		cb(null, Date.now()  + file.originalname);
	},
});

const uploadDocument = multer({ storage: documentStorage});



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

router.get('/search', async (req, res) => {
	try {
		console.log(req.query)
		const propertiesList = await User.aggregate([
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
			{
				$match: {
					'rooms.price': {
						$gte: parseInt(req.query.priceMin),
						$lte:parseInt(req.query.priceMax),
					},
					'rooms.surface': {
						$gte: parseInt(req.query.surfaceMin),
						$lte: parseInt(req.query.surfaceMax),
					},
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
		title: '',
		description: '',
		type: '',
		address: {},
		surface: '',
		commonSpaces: '',
		images: [],
		baths: '',
		bedrooms: ''
	});
	console.log(property)
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
			title: req.body.title,
			description: req.body.description,
			type: req.body.type,
			address: JSON.parse(req.body.address),
			surface: req.body.surface,
			commonSpaces: req.body.commonSpaces,
			bedrooms: req.body.bedroomsNumber,
			baths: req.body.bathsNumber,
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
		const property = await User.aggregate([
			{$match: { properties: { $in: [mongoose.Types.ObjectId(req.params.id)]}}},
			{
				$lookup: {
					from: Property.collection.name,
					localField: "properties",
					foreignField: "_id",
					as: "properties",
				},
			},
			{
				$project: {
					"property": {
						$filter: {
							input: "$properties",
							as: "property",
							cond: {
								$eq: ["$$property._id", mongoose.Types.ObjectId(req.params.id)]
							}
						}
					},
					"user" : { "email" : "$email", "firstName" : "$firstName", "lastName" : "$lastName", "photo" : "$photo", "userId" : "$_id" }
				}
			},
			{"$unwind": "$property" },
			{
				$lookup: {
					from: Room.collection.name,
					localField: "property.rooms",
					foreignField: "_id",
					as: "property.rooms",
				},
			},
		]);
		res.send(property);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.get('/owner/:id', async (req, res) => {
	try {
		const user = await User.findOne({
			properties: {
				$in: [mongoose.Types.ObjectId(req.params.id)]
			}
		});
		res.send(user);
	} catch (err) {
		res.status(400).send(err);
	}
});


router.patch('/title-description/:id', async (req, res) => {

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

// documents

router.post('/documents', uploadDocument.array('propertyDocuments'), async (req, res) => {

	try {
		const document = new Document({
			documentTitle: req.body.title,
			fileName: req.files[0].filename,
			startDate: req.body.startDate,
			endDate: req.body.endDate,
			documentType: req.body.documentType,
			price: parseInt(req.body.price),
			note: req.body.note,
		});

		const saveDocument = await document.save();
		const property = await Property.updateOne(
			{_id:  mongoose.Types.ObjectId(req.body.propertyId)},
			{$push: {documents: saveDocument._id}}
		);

		res.send(property);
	} catch (err) {
		res.status(400).send(err);
		console.log(err)
	}
});





module.exports = router;
