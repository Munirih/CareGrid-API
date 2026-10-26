
const mongoose = require('mongoose');

const validateCreateIntake = (req, res, next) => {
    const {
        patientId,
        facilityId,
        clinicalSymptoms,
        bloodPressure,
        temperature,
        notes
    } = req.body;

    // Check required IDs.
    if (!mongoose.isValidObjectId(patientId)) {
        return res.status(400).json({
            message: 'A valid patientId is required'
        });
    }

    if (!mongoose.isValidObjectId(facilityId)) {
        return res.status(400).json({
            message: 'A valid facilityId is required'
        });
    }

    // Check symptoms.
    if (
        typeof clinicalSymptoms !== 'string' ||
        clinicalSymptoms.trim().length < 3 ||
        clinicalSymptoms.trim().length > 2000
    ) {
        return res.status(400).json({
            message: 'Clinical symptoms must be between 3 and 2000 characters'
        });
    }

    // Check optional blood pressure.
    if (bloodPressure !== undefined && bloodPressure !== null &&
        bloodPressure !== '') {
        if (
            typeof bloodPressure !== 'string' ||
            !/^\d{2,3}\/\d{2,3}$/.test(bloodPressure.trim())
        ) {
            return res.status(400).json({
                message: 'Blood pressure must use the format 120/80'
            });
        }
    }

    // Check optional temperature.
    if (temperature !== undefined && temperature !== null &&
        temperature !== '') {
        const temp = Number(temperature);

        if (!Number.isFinite(temp) || temp < 25 || temp > 45) {
            return res.status(400).json({
                message: 'Temperature must be a number between 25 and 45 °C'
            });
        }

        req.body.temperature = temp;
    }

    // Check optional notes.
    if (notes !== undefined &&
        (typeof notes !== 'string' || notes.trim().length > 2000)) {
        return res.status(400).json({
            message: 'Notes must be text with a maximum of 2000 characters'
        });
    }

    // Continue to the controller if validation succeeds.
    next();
};

module.exports = {
    validateCreateIntake
};
