const router = require('express').Router();
const User = require('./users.models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.resolve(__dirname, '..', 'documents/users'))
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + file.originalname);
	},
});
const upload = multer({ storage: storage});



router.get('/', async (req, res) => {
	const user = await User.findOne({ email: req.query.userEmail }, { password: 0 } );
	try {
		console.log(user)
		res.send(user);
	} catch (error) {
		res.status(500).send(error);
	}
});

router.post('/sign-up', async (req, res) => {
	// CHECK IF EMAIL EXISTS IS CORRECT
	const emailCheck = await User.findOne({ email: req.body.email });
	if (emailCheck) return res.status(409).send({ message: 'Email already exists. please choose another one.' });
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

router.post('/sign-in', async (req, res) => {
	// CHECK IF EMAIL EXISTS IS CORRECT
	const emailCheck = await User.findOne({ email: req.body.email });
	if (!emailCheck) return res.status(404).send({message: `Email address not found. Maybe sign up?`
});
	// CHECK IF PASSWORD EXISTS AND NOT LINKED TO GOOGLE
	if (!emailCheck.password && (emailCheck.googleId || emailCheck.facebookId)) return res.status(409).send({message:`This account is already registred with Google or Facebook` });
	// CHECK IF PASSWORD IS CORRECT
	const validPass = await bcrypt.compare(req.body.password, emailCheck.password);
	if (!validPass) return res.status(403).send({message:'Invalid password'});

	try {
		return res.send(emailCheck);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.post('/sign-in-with-google', async (req, res) => {
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
		return res.status(204).send(existingUser);
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
		return res.status(204).send(existingUser);
	}
});

router.post('/check-onboarding', async (req, res) => {
	const existingUser = await User.findOne({ email: req.body.email });
	try {
		console.log(existingUser);
		if (!existingUser) {
			return res.status(404).send('None');
		}
		res.send(existingUser)
	} catch (error) {
		res.status(400).send(error);
	}
});

router.post('/update-application-form', async (req, res) => {
	try {
		const user = await User.findOneAndUpdate({ email:  req.body.email }, {
			$set: {
				[`questions.${req.body.step}`]: req.body.answers
			}
		}, { new: true });

		if (!user) {
			return res.status(404).send();
		}
		res.send(user);
	} catch (error) {
		console.log(error)
		res.status(500).send(error);
	}
});

router.patch('/update-personal-informations', async (req, res) => {

	try {
		const user = await User.findOneAndUpdate({ email:  req.query.userEmail }, {personalInformations: req.body }, { new: true });
		if (!user) {
			return res.status(404).send();
		}
		res.send(user);
	} catch (error) {
		console.log(error)
		res.status(500).send(error);
	}
});

router.patch('/update-personal-documents', upload.any(), async (req, res) => {

	const personalDocuments = req.files.map(file => {
		return {documentType: file.fieldname, originalname: file.originalname, filename: file.filename,  mimetype: file.mimetype, size: file.size }
	})

	try {
		const user = await User.findOneAndUpdate({ email:  req.query.userEmail }, {personalDocuments: personalDocuments }, { new: true });

		if (!user) {
			return res.status(404).send();
		}
		res.send(user);
	} catch (error) {
		console.log(error)
		res.status(500).send(error);
	}
});

router.patch('/update-living-preferences', async (req, res) => {

	try {
		const user = await User.findOneAndUpdate({ email:  req.query.userEmail }, {livingPreferences: req.body }, { new: true });

		if (!user) {
			return res.status(404).send();
		}
		res.send(user);
	} catch (error) {
		console.log(error)
		res.status(500).send(error);
	}
});

router.patch('/update-personnality-traits', async (req, res) => {
	try {
		const user = await User.findOneAndUpdate({ email:  req.query.userEmail }, {personnalityTraits: req.body }, { new: true });

		if (!user) {
			return res.status(404).send();
		}
		res.send(user);
	} catch (error) {
		console.log(error)
		res.status(500).send(error);
	}
});

router.patch('/update-passions-list', async (req, res) => {
	try {
		const user = await User.findOneAndUpdate({ email:  req.query.userEmail }, {passionsList: req.body }, { new: true });
		if (!user) {
			return res.status(404).send();
		}
		res.send(user);
	} catch (error) {
		console.log(error)
		res.status(500).send(error);
	}
});

router.get('/get-application-form-data/:dataType', async (req, res) => {
	const answers = await User.findOne({ email: req.query.userEmail }, `${req.params.dataType}` );
	try {
		res.send(answers);
	} catch (error) {
		res.status(500).send(error);
	}
});

router.get('/files/:filename', (req, res) => {
	const { filename } = req.params;
	const filePath = path.join(__dirname, '../documents/users/', filename);
	const stat = fs.statSync(filePath);

	res.writeHead(200, {
		'Content-Type': 'application/pdf',
		'Content-Length': stat.size
	});

	const stream = fs.createReadStream(filePath);
	console.log(res)
	stream.pipe(res);
});

module.exports = router;
