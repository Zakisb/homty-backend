const router = require('express').Router();
const Property = require('./properties.models');
const mongoose = require('mongoose');
const User = require('../users/users.models');
const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.resolve(__dirname, '..', 'images/properties'))
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + file.originalname);
	},
});
const upload = multer({ storage: storage});

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

module.exports = router;
