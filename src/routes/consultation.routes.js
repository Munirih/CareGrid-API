const express = require('express');

const { createConsultation } = require('../controllers/consultation.controller');

const { validateCreateConsultation } = require('../validations/consultation.validation');

const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate)

router.post('/', validateCreateConsultation, createConsultation);

module.exports = router;
