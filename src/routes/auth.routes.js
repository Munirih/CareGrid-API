const express = require('express')

const { registerUser, loginUser, getMe } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validations/user.validation');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', validateRegister, registerUser)

router.post('/login', validateLogin, loginUser)

router.get('/me', authenticate, getMe)

module.exports = router;