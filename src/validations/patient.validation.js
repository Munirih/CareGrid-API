
const mongoose = require('mongoose');

const allowedGenders = [
    'female',
    'male',
    'other',
    'prefer_not_to_say'
];

// Validate date of birth in YYYY-MM-DD format.
const isValidDateOfBirth = (dateOfBirth) => {
    if (typeof dateOfBirth !== 'string') {
        return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
        return false;
    }

    const date = new Date(`${dateOfBirth}T00:00:00.000Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === dateOfBirth &&
        date <= new Date()
    );
};

// Validate fields used when registering a patient profile.
const validateRegisterPatient = (req, res, next) => {
    const { patientUserId, dateOfBirth, gender } = req.body;

    if (!mongoose.isValidObjectId(patientUserId)) {
        return res.status(400).json({
            message: 'Please provide a valid patient account ID'
        });
    }

    if (
        dateOfBirth !== undefined &&
        dateOfBirth !== null &&
        dateOfBirth !== '' &&
        !isValidDateOfBirth(dateOfBirth)
    ) {
        return res.status(400).json({
            message: 'Date of birth must be a valid date in YYYY-MM-DD format'
        });
    }

    if (
        gender !== undefined &&
        gender !== null &&
        !allowedGenders.includes(gender)
    ) {
        return res.status(400).json({
            message: 'Please provide a valid gender'
        });
    }

    next();
};

// Validate fields used when updating a patient profile.
const validateUpdatePatient = (req, res, next) => {
    const { dateOfBirth, gender } = req.body;

    if (!mongoose.isValidObjectId(req.params.patientId)) {
        return res.status(400).json({
            message: 'Please provide a valid patient profile ID'
        });
    }

    if (
        dateOfBirth === undefined &&
        gender === undefined
    ) {
        return res.status(400).json({
            message: 'Provide at least one field to update'
        });
    }

    if (
        dateOfBirth !== undefined &&
        dateOfBirth !== null &&
        dateOfBirth !== '' &&
        !isValidDateOfBirth(dateOfBirth)
    ) {
        return res.status(400).json({
            message: 'Date of birth must be a valid date in YYYY-MM-DD format'
        });
    }

    if (
        gender !== undefined &&
        gender !== null &&
        gender !== '' &&
        !allowedGenders.includes(gender)
    ) {
        return res.status(400).json({
            message: 'Please provide a valid gender'
        });
    }

    next();
};

module.exports = {
    validateRegisterPatient,
    validateUpdatePatient
};
