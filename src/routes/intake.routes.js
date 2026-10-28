

const express = require('express');

const authenticate = require('../middlewares/auth.middleware');

const { validateCreateIntake } = require('../validations/intake.validation');

const { createIntake } = require('../controllers/intake.controller');

const router = express.Router();
router.use(authenticate)

router.post('/', validateCreateIntake, createIntake);

module.exports = router;

