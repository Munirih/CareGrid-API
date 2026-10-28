const express = require('express');
const router = express.Router();

const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const {
    requestConsultation,
    createConsultation
} = require('../controllers/consultation.controller');

const {
    validateCreateConsultation
} = require('../validations/consultation.validation');

router.use(authenticate);

router.post(
    '/request',
    authorize('patient'),
    validateCreateConsultation,
    requestConsultation
);

router.post(
    '/',
    authorize('doctor'),
    validateCreateConsultation,
    createConsultation
);

module.exports = router;