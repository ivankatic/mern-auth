const User = require('../models/auth.model');
const expressJwt = require('express-jwt');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const expressJWT = require('express-jwt');
const { errorHandler } = require('../helpers/dbErrorHandling');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.MAIL_KEY);

exports.registerController = (req, res) => {
	const { name, email, password } = req.body;
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const firstError = errors.array().map((error) => error.msg)[0];
		return res.status(422).json({
			errors: firstError,
		});
	} else {
		User.findOne({
			email,
		}).exec((err, user) => {
			if (user) {
				return res.status(400).json({
					errors: 'Email is taken',
				});
			}
		});

		const token = jwt.sign(
			{
				name,
				email,
				password,
			},
			process.env.JWT_ACCOUNT_ACTIVATION,
			{
				expiresIn: '60m',
			}
		);

		const emailData = {
			from: process.env.EMAIL_FROM,
			to: email,
			subject: 'Account activation link',
			html: `
			<h1>Please use the following link to activate your account</h1>
			<p>${process.env.CLIENT_URL}/users/activate/${token}</p>
			<hr />
			<p>This email may contain sensitive information</p>
			<p>${process.env.CLIENT_URL}</p>`,
		};

		sgMail
			.send(emailData)
			.then((sent) => {
				return res.json({
					message: `Email has been sent to ${email}`,
				});
			})
			.catch((err) => {
				return res.status(400).json({
					success: false,
					errors: errorHandler(err),
				});
			});
	}
};

exports.activationController = (req, res) => {
	const { token } = req.body;

	if (token) {
		jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
			if (err) {
				console.log('Activation error');
				return res.status(401).json({
					errors: 'Activation link has expired. Please sign up again.',
				});
			} else {
				const { name, email, password } = jwt.decode(token);

				const user = new User({
					name,
					email,
					password,
				});

				user.save((err, user) => {
					if (err) {
						console.log('Save error', errorHandler(err));
						return res.status(401).json({
							errors: errorHandler(err),
						});
					} else {
						return res.json({
							success: true,
							message: user,
							message: 'Signup successful',
						});
					}
				});
			}
		});
	} else {
		return res.json({
			message: 'An error has occurred. Please try again.',
		});
	}
};

exports.loginController = (req, res) => {
	const { email, password } = req.body;
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const firstError = errors.array().map((error) => error.msg)[0];
		return res.status(422).json({
			errors: firstError,
		});
	} else {
		User.findOne({
			email,
		}).exec((err, user) => {
			if (err || !user) {
				return res.status(400).json({
					error: 'User with that email does not exist.',
				});
			}

			if (!user.authenticate(password)) {
				return res.status(400).json({
					error: 'Email and password do not match',
				});
			}

			const token = jwt.sign(
				{
					_id: user._id,
				},
				process.env.JWT_SECRET,
				{
					expiresIn: '7d',
				}
			);

			const { _id, name, email, role } = user;
			return res.json({
				token,
				user: {
					_id,
					name,
					email,
					role,
				},
			});
		});
	}
};

exports.forgetController = (req, res) => {
	const { email } = req.body;
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const firstError = errors.array().map((error) => error.msg)[0];
		return res.status(422).json({
			errors: firstError,
		});
	} else {
		User.findOne({ email }, (err, user) => {
			if (err || !user) {
				return res.status(400).json({
					error: 'User with that email address does not exist.',
				});
			}

			const token = jwt.sign(
				{
					_id: user._id,
				},
				process.env.JWT_RESET_PASSWORD,
				{
					expiresIn: '60m',
				}
			);

			const emailData = {
				from: process.env.EMAIL_FROM,
				to: email,
				subject: 'Password reset link',
				html: `
				<h1>Please use the following to reset your password</h1>
				<p>${process.env.CLIENT_URL}/users/passwords/reset/${token}</p>
				<hr />
				<p>This email may contain sensitive information</p>
				<p>${process.env.CLIENT_URL}</p>`,
			};

			return user.updateOne(
				{
					resetPasswordLink: token,
				},
				(err, success) => {
					if (err) {
						return res.status(400).json({
							error: errorHandler(err),
						});
					} else {
						sgMail
							.send(emailData)
							.then((sent) => {
								return res.json({
									message: `Email has been sent to ${email}`,
								});
							})
							.catch((err) => {
								return res.json({
									message: err.message,
								});
							});
					}
				}
			);
		});
	}
};

exports.resetController = (req, res) => {
	const { resetPasswordLink, newPassword } = req.body;

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const firstError = errors.array().map((error) => error.msg)[0];
		return res.status(422).json({
			errors: firstError,
		});
	} else {
		if (resetPasswordLink) {
			jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (
				err,
				decoded
			) {
				if (err) {
					return res.status(400).json({
						error: 'Expired link. Try again',
					});
				}

				User.findOne(
					{
						resetPasswordLink,
					},
					(err, user) => {
						if (err || !user) {
							return res.status(400).json({
								error: 'Something went wrong. Try later',
							});
						}

						const updatedFields = {
							password: newPassword,
							resetPasswordLink: '',
						};

						user = _.extend(user, updatedFields);

						user.save((err, result) => {
							if (err) {
								return res.status(400).json({
									error: 'Error resetting user password',
								});
							}
							res.json({
								message: `Great! Now you can login with your new password`,
							});
						});
					}
				);
			});
		}
	}
};
