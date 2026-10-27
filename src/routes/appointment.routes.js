
const express = require('express');

const authenticate = require('../middlewares/auth.middleware');
const { validateCreateAppointment, validateDoctorAppointments, validateUpdateAppointmentStatus } = require('../validations/appointment.validation');
const { createAppointment, getDoctorAppointments, updateAppointmentStatus, getAppointmentDetails } = require('../controllers/appointment.controller');

const router = express.Router();

router.post('/', authenticate, validateCreateAppointment, createAppointment);
router.get('/doctor', authenticate, validateDoctorAppointments, getDoctorAppointments);
router.patch('/:appointmentId/status', authenticate, validateUpdateAppointmentStatus, updateAppointmentStatus);
router.get('/:appointmentId', authenticate, getAppointmentDetails);

module.exports = router;

