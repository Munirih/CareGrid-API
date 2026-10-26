
const mongoose = require('mongoose');

const validateCreateAppointment = (req, res, next) => {
    const {
        patientId,
        intakeId,
        doctorId,
        facilityId,
        scheduledAt,
        reasonForVisit,
        complaint
    } = req.body;

    // Validate the required MongoDB IDs.
    const ids = {
        patientId,
        intakeId,
        doctorId,
        facilityId
    };

    for (const [field, value] of Object.entries(ids)) {
        if (!mongoose.isValidObjectId(value)) {
            return res.status(400).json({
                message: `${field} must be a valid ID`
            });
        }
    }

    // Validate the appointment date and time.
    if (
        typeof scheduledAt !== 'string' ||
        scheduledAt.trim() === '' ||
        Number.isNaN(Date.parse(scheduledAt))
    ) {
        return res.status(400).json({
            message: 'A valid appointment date and time is required'
        });
    }

    const appointmentDate = new Date(scheduledAt);

    if (appointmentDate <= new Date()) {
        return res.status(400).json({
            message: 'Appointment date and time must be in the future'
        });
    }

    // Validate the reason for the visit.
    if (
        typeof reasonForVisit !== 'string' ||
        reasonForVisit.trim().length < 3 ||
        reasonForVisit.trim().length > 500
    ) {
        return res.status(400).json({
            message: 'Reason for visit must be between 3 and 500 characters'
        });
    }

    if (
    typeof complaint !== 'string' ||
    complaint.trim().length < 3 ||
    complaint.trim().length > 2000
    ) {
    return res.status(400).json({
        message: 'Complaint must be between 3 and 2000 characters'
    });
}

    next();
};

const validateDoctorAppointments = (req, res, next) => {
    if (!mongoose.isValidObjectId(req.user.userId)) {
        return res.status(400).json({
            message: 'Invalid doctor ID'
        });
    }

    next();
};


module.exports = {
    validateCreateAppointment,
    validateDoctorAppointments
};
