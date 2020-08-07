const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validation');

router.post('/register', async (req, res) => {
	// Validate
	const validation = registerValidation(req.body);
	if (validation.error) return res.status(400).send(validation.error.message);

	// Check if user exists
	const emailExists = await User.findOne({ email: req.body.email });
	if (emailExists) return res.status(400).send('User already exists.');

	// Hash the password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	// Create a new user
	const user = new User({
		username: req.body.username,
		email: req.body.email,
		password: hashedPassword,
	});

	try {
		const savedUser = await user.save();
		res.send({ user: user._id });
	} catch (err) {
		res.status(400).send(err);
	}
});

router.post('/login', async (req, res) => {
	// Validate
	const validation = loginValidation(req.body);
	if (validation.error) return res.status(400).send(validation.error.message);

	// Check if user exists
	const user = await User.findOne({ email: req.body.email });
	if (!user) return res.status(400).send('Email or password is not correct.');

	// Check password
	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(400).send('Invalid password.');

	// Assign a token
	const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
	res.header('auth-token', token).send(token);
});

module.exports = router;
