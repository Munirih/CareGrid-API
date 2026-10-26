const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const { validateRegisterPatient, validateUpdatePatient } = require('../validations/patient.validation');
const { registerPatientProfile, getPatientProfile, updatePatientProfile, getAllPatients } = require('../controllers/patient.controller');

const router = express.Router();

// PHC worker registers a patient and assigns a doctor
router.post('/create', authenticate, validateRegisterPatient, registerPatientProfile);

// Patient views their own profile
router.get('/profile', authenticate, getPatientProfile);

// Worker updates a patient's profile
router.patch('/:patientId', authenticate, validateUpdatePatient, updatePatientProfile);

// Worker gets the list of all patients
router.get('/', authenticate, getAllPatients);

module.exports = router;