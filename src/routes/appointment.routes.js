const express = require('express');
const router = express.Router();

const authenticate = require('../middlewares/auth.middleware');

const {
    validateCreateAppointment,
    validateDoctorAppointments,
    validateUpdateAppointmentStatus
} = require('../validations/appointment.validation');

const {
    createAppointment,
    getDoctorAppointments,
    updateAppointmentStatus,
    getAppointmentDetails
} = require('../controllers/appointment.controller');

router.use(authenticate);

// PHC workers book appointments.
router.post(
    '/',
    validateCreateAppointment,
    createAppointment
);

// Doctors view their assigned appointments.
router.get(
    '/doctor',
    validateDoctorAppointments,
    getDoctorAppointments
);

// Doctors update appointment status.
router.patch(
    '/:appointmentId/status',
    validateUpdateAppointmentStatus,
    updateAppointmentStatus
);

// Doctors view appointment details.
router.get(
    '/:appointmentId',
    getAppointmentDetails
);

module.exports = router;