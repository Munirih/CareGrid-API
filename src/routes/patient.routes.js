const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const { registerPatientIntake, getPatientProfile, updatePatientProfile } = require('../controllers/patient.controller');

const router = express.Router();

// PHC worker registers a patient and assigns a doctor
router.post('/intake', authenticate, registerPatientIntake);

// Patient views their own profile
router.get('/profile', authenticate, getPatientProfile);

// Worker updates a patient's profile
router.patch('/:patientId/profile', authenticate, updatePatientProfile);

module.exports = router;