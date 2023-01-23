const router = require('express').Router();
const User = require('./users.models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

router.post('/sign-up', async (req, res) => {

	// CHECK IF EMAIL EXISTS IS CORRECT
	const emailCheck = await User.findOne({ email: req.body.email });
	if (emailCheck) return res.status(400).send('Email already exists. please choose another one');

	const hashedPassword = await bcrypt.hash(req.body.password, 10);

	const addUser = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: hashedPassword,
		photo: 'default.jpeg'
	});

	try {
		const saveUser = await addUser.save();
		res.send(saveUser);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.post('/sign-in-with-google', async (req, res) => {
	console.log('passed')
	const { account, profile } = req.body;
	const email = profile.email;
	const googleId = account.providerAccountId;
	const existingUser = await User.findOne({ email: email });
	if (!existingUser) {
		// Create new user with googleId
		const newUser = new User({
			googleId: googleId,
			email: email,
			email_verified: profile.email_verified,
			photo: 'newUser.jpg',
			firstName: profile.family_name,
			lastName: profile.given_name
		});
		await newUser.save();
		return res.send(newUser);
	} else {
		// Check if the user has googleId
		if (existingUser.googleId) {
			// User already signed in with google
			return res.status(409).send({ message: 'User already signed in with google' });
		}
		// Update the existing user with googleId
		existingUser.googleId = googleId;
		await existingUser.save();
		return res.send(existingUser);
	}
});

router.post('/sign-in-with-facebook', async (req, res) => {

	const { account, profile } = req.body;
	console.log(req.body)
	const email = profile.email;
	const facebookId = account.providerAccountId;
	const existingUser = await User.findOne({ email: email });

	if (!existingUser) {
		// Create new user with googleId
		const newUser = new User({
			facebookId: facebookId,
			email: email,
			email_verified: profile.email_verified,
			photo: 'newUser.jpg',
			firstName: profile.family_name,
			lastName: profile.given_name
		});
		await newUser.save();
		return res.send(newUser);
	} else {
		// Check if the user has facebookId
		if (existingUser.facebookId) {
			// User already signed in with google
			return res.status(409).send({ message: 'User already signed in with facebook' });
		}
		// Update the existing user with googleId
		existingUser.facebookId = facebookId;
		await existingUser.save();
		return res.send(existingUser);
	}
});

router.patch('/update-application-form/:id', async (req, res) => {
	try {
		const user = await User.findOneAndUpdate({ _id:  mongoose.Types.ObjectId(req.params.id) }, {
			$set: {
				[`questions.${req.body.step}`]: req.body.answers
			}
		}, { new: true, useFindAndModify: false });
		if (!user) {
			return res.status(404).send();
		}
		res.send(user);
	} catch (error) {
		res.status(500).send(error);
	}
});

module.exports = router;
