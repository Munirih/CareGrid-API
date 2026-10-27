const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const { validateRegisterPatient, validateUpdatePatient } = require('../validations/patient.validation');
const { registerPatientProfile, getPatientProfile, updatePatientProfile, getAllPatients } = require('../controllers/patient.controller');



const router = express.Router();

router.use(authenticate)
// PHC worker registers a patient and assigns a doctor
router.post('/create', validateRegisterPatient, registerPatientProfile);

// Patient views their own profile
router.get('/profile', getPatientProfile);

// Worker updates a patient's profile
router.patch('/:patientId', validateUpdatePatient, updatePatientProfile);

// Worker gets the list of all patients
router.get('/', getAllPatients);

module.exports = router;