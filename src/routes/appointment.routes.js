const express = require('express');
const authenticate = require('../middlewares/auth.middleware');
const { validateCreateAppointment, validateDoctorAppointments, validateUpdateAppointmentStatus } = require('../validations/appointment.validation');
const { createAppointment, getDoctorAppointments, updateAppointmentStatus, getAppointmentDetails } = require('../controllers/appointment.controller');

const router = express.Router();
router.use(authenticate)

router.post('/', validateCreateAppointment, createAppointment);
router.get('/doctor', validateDoctorAppointments, getDoctorAppointments);
router.patch('/:appointmentId/status', validateUpdateAppointmentStatus, updateAppointmentStatus);
router.get('/:appointmentId', getAppointmentDetails);

module.exports = router;

