const router = require('express').Router();
const { Document, Property } = require('./properties.models');
const mongoose = require('mongoose');
const User = require('../users/users.models');
const multer = require('multer');
const path = require('path');
const Room = require('../rooms/rooms.models');
const { v4: uuidv4 } = require('uuid');
const randomstring = require('randomstring');
const { uploadFilesToGCS } = require('../utils/gcsHelper');


const multerGc = multer({
	storage: multer.memoryStorage(),
});

router.get('/search', async (req, res) => {
	const { priceMin, priceMax, surfaceMin, surfaceMax } = req.query;
	try {
		const propertiesList = await Property.aggregate([
			{$match: {"deleted": false}},
			{
				$lookup: {
					from: Room.collection.name,
					localField: "rooms",
					foreignField: "_id",
					as: "rooms",
				},
			},
			{
				$addFields: {
					rooms: {
						$filter: {
							input: "$rooms",
							as: "room",
							cond: {
								$and: [
									{ $gte: ["$$room.price", parseInt(priceMin)] },
									{ $lte: ["$$room.price", parseInt(priceMax)] },
									{ $gte: ["$$room.surface", parseInt(surfaceMin)] },
									{ $lte: ["$$room.surface", parseInt(surfaceMax)] },
									{ $eq: ["$$room.deleted", false] }
								],
							},
						},
					},
				},
			},
			{
				$match: {
					// filter out properties with empty rooms array
					$expr: {
						$gt: [{ $size: "$rooms" }, 0]
					}
				}
			}
		]);
		res.send(propertiesList)
	} catch (err) {
		console.log(err);
		res.status(400).send(err);
	}
});
router.get('/:id', async (req, res) => {
	try {
		const property = await Property.findById(mongoose.Types.ObjectId(req.params.id)).populate('rooms');
		const filteredRooms = property.rooms.filter(room => !room.deleted);
		if (!property) return res.status(404).send({ message: 'Property not found' });

		property.rooms = filteredRooms

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
		},).select('_id firstName lastName email personalInformations');
		res.send(user);
	} catch (err) {
		console.log(err)
		res.status(400).send(err);
	}
});

router.post('/', multerGc.any(), async (req, res) => {

	try {
		const filesMetadata = await uploadFilesToGCS(req.files, 'homtystorage');
		const uploadedImages = filesMetadata.map(function (item) {
			return item.filename;
		});
		const property = new Property({ ...req.body, address: JSON.parse(req.body.address), images: uploadedImages });
		const savePropery = await property.save();
		const propertyOwner = await User.updateOne(
			{ email: req.query.userEmail },
			{ $push: { properties: savePropery._id } }
		);
		res.status(201).json(savePropery);
	} catch (err) {
		console.log(err);
		res.status(400).send(err);
	}
});

router.get('/', async (req, res) => {

	try {
		const propertiesList = await User.aggregate([
			{ $match: { email: req.query.userEmail } },
			{
				$lookup: {
					from: Property.collection.name,
					localField: 'properties',
					foreignField: '_id',
					as: 'properties'
				}
			},
			{ '$unwind': '$properties' },
			{ $match: { 'properties.deleted': false } },
			{
				$lookup: {
					from: Room.collection.name,
					localField: 'properties.rooms',
					foreignField: '_id',
					as: 'rooms'
				}
			},
			{
				$match: {
					'rooms.deleted': false
				}
			},
			{
				$project: {
					_id: null,
					property: '$properties',
					rooms: {
						$filter: {
							input: '$rooms',
							as: 'room',
							cond: { $eq: ['$$room.deleted', false] }
						}
					}
				}
			}
		]);
		res.send(propertiesList);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.patch('/:id', multerGc.any(),  async (req, res) => {

	try {
		const filesMetadata = await uploadFilesToGCS(req.files, 'homtystorage');
		const uploadedImages = filesMetadata.map(function (item) {
			return item.filename;
		});
		const images = [...uploadedImages, ...(Array.isArray(req.body.images) ? req.body.images : (req.body.images != null ? [req.body.images] : [])) ];
		req.body.images = images;
		const property = await Property.findByIdAndUpdate(req.params.id, {
			...req.body,
			address: JSON.parse(req.body.address)
		}, { new: true });


		if (!property) {
			return res.status(404).send();
		}
		res.send(property);
	} catch (err) {
		console.log(err)
		res.status(400).send(err);
	}
});

router.delete('/:id', async (req, res) => {
	try {
		const deleteProperty = await Property.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.params.id) }, { deleted: true });
		res.send(deleteProperty);
	} catch (err) {
		console.log(err);
		res.status(400).send(err);
	}
});
//search


router.get('/documents/:userEmail', async (req, res) => {
	try {
		const propertiesList = await User.aggregate([
			{ $match: { email: req.params.userEmail } },
			{
				$lookup: {
					from: Property.collection.name,
					localField: 'properties',
					foreignField: '_id',
					as: 'properties'
				}
			},
			{ '$unwind': '$properties' },
			{ $match: { 'properties.deleted': false } },
			{
				$lookup: {
					from: Document.collection.name,
					localField: 'properties.documents',
					foreignField: '_id',
					as: 'properties.documents'
				}
			},
			{
				$project: {
					_id: '$properties._id',
					property: '$properties.title',
					documents: {
						$filter: {
							input: '$properties.documents',
							as: 'document',
							cond: { $eq: ['$$document.deleted', false] }
						}
					}

				}
			},
		]);
		res.send(propertiesList);
	} catch (err) {
		console.log(err);
		res.status(400).send(err);
	}
});

router.post('/documents', multerGc.any(), async (req, res) => {
	try {
		const filesMetadata = await uploadFilesToGCS(req.files, 'homtystorage');
		const document = new Document({
			documentTitle: req.body.title,
			documentType: req.body.documentType,
			filename: filesMetadata[0].filename,
			originalname: filesMetadata[0].originalname,
			note: req.body.note
		});
		const saveDocument = await document.save();
		const property = await Property.updateOne(
			{ _id: mongoose.Types.ObjectId(req.body.propertyId) },
			{ $push: { documents: saveDocument._id } }
		);

		res.send(property);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.delete('/documents/:id', async (req, res) => {
	try {
		const deleteDocument = await Document.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.params.id) }, { deleted: true });
		res.send(deleteDocument);
	} catch (err) {
		console.log(err);
		res.status(400).send(err);
	}
});

module.exports = router;
