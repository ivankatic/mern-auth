const router = require('express').Router();
const {
	validRegistration,
	validLogin,
	forgotPasswordValidator,
	resetPasswordValidator,
} = require('../helpers/validate');

// Load Controllers
const {
	registerController,
	activationController,
	loginController,
	forgetController,
	resetController,
} = require('../controllers/auth.controller.js');

router.post('/register', validRegistration, registerController);
router.post('/login', validLogin, loginController);
router.post('/activation', activationController);
router.put('/passwords/forgotten', forgotPasswordValidator, forgetController);
router.put('/passwords/reset', resetPasswordValidator, resetController);

module.exports = router;
