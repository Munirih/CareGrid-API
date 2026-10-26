
const express = require('express');

const authenticate = require('../middlewares/auth.middleware');
const { validateCreateAppointment, validateDoctorAppointments } = require('../validations/appointment.validation');
const { createAppointment, getDoctorAppointments } = require('../controllers/appointment.controller');

const router = express.Router();

router.post('/', authenticate, validateCreateAppointment, createAppointment);
router.get('/doctor', authenticate, validateDoctorAppointments, getDoctorAppointments);

module.exports = router;

