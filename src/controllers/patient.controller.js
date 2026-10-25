
const mongoose = require('mongoose');
const calculateAge = require('../utils/calculateAge');
const PatientModel = require('../models/patient.model');
const UserModel = require('../models/user.model');

const allowedGenders = [
    'female',
    'male',
    'other',
    'prefer_not_to_say'
];

// Validate a date in YYYY-MM-DD format.
// The date cannot be in the future.
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

// Format a patient profile consistently in API responses.
const formatPatient = (patient) => ({
    _id: patient._id,
    userId: patient.userId,
    fullName: patient.fullName,
    dateOfBirth: patient.dateOfBirth
        ? patient.dateOfBirth.toISOString().slice(0, 10)
        : null,
    age: patient.dateOfBirth
        ? calculateAge(patient.dateOfBirth)
        : null,
    gender: patient.gender ?? null,
    registeredBy: patient.registeredBy ?? null
});


// 1. PHC worker registers a patient profile.
const registerPatientIntake = async (req, res, next) => {
    try {
        const worker = await UserModel.findById(req.user.userId);

        if (
            !worker ||
            !worker.isActive ||
            worker.accountStatus !== 'active'
        ) {
            return res.status(403).json({
                message: 'Worker account is not active'
            });
        }

        if (worker.role !== 'worker') {
            return res.status(403).json({
                message: 'Only PHC workers can register patients'
            });
        }

        const { patientUserId, dateOfBirth, gender } = req.body;

        // Validate the existing patient account ID.
        if (!mongoose.isValidObjectId(patientUserId)) {
            return res.status(400).json({
                message: 'Please provide a valid patient account ID'
            });
        }

        // Confirm that the account belongs to an active patient.
        const patientUser = await UserModel.findOne({
            _id: patientUserId,
            role: 'patient',
            isActive: true
        });

        if (!patientUser) {
            return res.status(400).json({
                message: 'Patient account not found or inactive'
            });
        }

        // Validate optional date of birth.
        if (
            dateOfBirth !== undefined &&
            dateOfBirth !== null &&
            dateOfBirth !== '' &&
            !isValidDateOfBirth(dateOfBirth)
        ) {
            return res.status(400).json({
                message: 'Please provide a valid date of birth in YYYY-MM-DD format'
            });
        }

        // Validate optional gender.
        if (
            gender !== undefined &&
            gender !== null &&
            !allowedGenders.includes(gender)
        ) {
            return res.status(400).json({
                message: 'Please provide a valid gender'
            });
        }

        // Check whether this patient already has a profile.
        let patient = await PatientModel.findOne({
            userId: patientUser._id
        });

        const profileAlreadyExists = Boolean(patient);

        if (patient) {
            // Update the existing profile without erasing
            // information that was not provided.
            patient.fullName = patientUser.fullName;
            patient.registeredBy = worker._id;

            if (
                dateOfBirth !== undefined &&
                dateOfBirth !== null &&
                dateOfBirth !== ''
            ) {
                patient.dateOfBirth = new Date(
                    `${dateOfBirth}T00:00:00.000Z`
                );
            }

            if (gender !== undefined && gender !== null) {
                patient.gender = gender;
            }

            await patient.save();
        } else {
            // Create a profile without assigning a facility
            // or doctor.
            patient = await PatientModel.create({
                userId: patientUser._id,
                fullName: patientUser.fullName,
                dateOfBirth:
                    dateOfBirth && dateOfBirth !== ''
                        ? new Date(`${dateOfBirth}T00:00:00.000Z`)
                        : null,
                gender: gender || null,
                registeredBy: worker._id
            });
        }

        return res.status(profileAlreadyExists ? 200 : 201).json({
            message: profileAlreadyExists
                ? 'Patient profile updated successfully'
                : 'Patient profile registered successfully',
            patient: formatPatient(patient)
        });
    } catch (error) {
        next(error);
    }
};


// 2. Patient views their own profile.
const getPatientProfile = async (req, res, next) => {
    try {
        if (req.user.role !== 'patient') {
            return res.status(403).json({
                message: 'Only patients can view their own profile'
            });
        }

        const user = await UserModel.findById(req.user.userId);

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: 'Account unavailable'
            });
        }

        const patient = await PatientModel.findOne({
            userId: user._id
        });

        if (!patient) {
            return res.status(404).json({
                message: 'Patient profile not found'
            });
        }

        return res.status(200).json({
            patient: formatPatient(patient)
        });
    } catch (error) {
        next(error);
    }
};


// 3. Active PHC worker updates a patient's basic profile.
const updatePatientProfile = async (req, res, next) => {
    try {
        const worker = await UserModel.findById(req.user.userId);

        if (
            !worker ||
            !worker.isActive ||
            worker.accountStatus !== 'active'
        ) {
            return res.status(403).json({
                message: 'Worker account is not active'
            });
        }

        if (worker.role !== 'worker') {
            return res.status(403).json({
                message: 'Only PHC workers can update patient profiles'
            });
        }

        // Validate the patient profile ID in the URL.
        if (!mongoose.isValidObjectId(req.params.patientId)) {
            return res.status(400).json({
                message: 'Please provide a valid patient ID'
            });
        }

        const patient = await PatientModel.findById(
            req.params.patientId
        );

        if (!patient) {
            return res.status(404).json({
                message: 'Patient profile not found'
            });
        }

        const { dateOfBirth, gender } = req.body;

        // Ensure at least one field was supplied.
        if (
            dateOfBirth === undefined &&
            gender === undefined
        ) {
            return res.status(400).json({
                message: 'Provide at least one field to update'
            });
        }

        // Update date of birth only when supplied.
        if (dateOfBirth !== undefined) {
            if (
                dateOfBirth === null ||
                dateOfBirth === ''
            ) {
                patient.dateOfBirth = null;
            } else {
                if (!isValidDateOfBirth(dateOfBirth)) {
                    return res.status(400).json({
                        message: 'Please provide a valid date of birth in YYYY-MM-DD format'
                    });
                }

                patient.dateOfBirth = new Date(
                    `${dateOfBirth}T00:00:00.000Z`
                );
            }
        }

        // Update gender only when supplied.
        if (gender !== undefined) {
            if (
                gender !== null &&
                gender !== '' &&
                !allowedGenders.includes(gender)
            ) {
                return res.status(400).json({
                    message: 'Invalid gender value'
                });
            }

            patient.gender = gender || null;
        }

        await patient.save();

        return res.status(200).json({
            message: 'Patient profile updated successfully',
            patient: formatPatient(patient)
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    registerPatientIntake,
    getPatientProfile,
    updatePatientProfile
};
