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


router.post('/', upload.array("images"), async (req, res) => {
	const images = req.files.map(function(item) {
		return item.filename
	})

	const property = new Property({
		type: req.body.type,
		address: req.body.address,
		surface: req.body.surface,
		commonSpaces: req.body.commonSpaces,
		images: images
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

router.get('/:id', async (req, res) => {

	try {
		const property = await Property.findOne({ _id:  mongoose.Types.ObjectId( req.params.id)});
		res.send(property);

	} catch (err) {
		res.status(400).send(err);
	}
});

module.exports = router;
