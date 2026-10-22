const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const { createPatientProfile } = require('../controllers/patient.controller');

const router = express.Router();

router.post('/profile', authenticate, createPatientProfile);

module.exports = router;