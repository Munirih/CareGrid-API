const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const { createPatientProfile, getPatientProfile, updatePatientProfile } = require('../controllers/patient.controller');

const router = express.Router();

router.post('/profile', authenticate, createPatientProfile);
router.get('/profile', authenticate, getPatientProfile);
router.patch('/profile', authenticate, updatePatientProfile);

module.exports = router;