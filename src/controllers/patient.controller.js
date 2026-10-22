const calculateAge = require('../utils/calculateAge');

const PatientModel = require('../models/patient.model');
const UserModel = require('../models/user.model');

const createPatientProfile = async (req, res, next) => {
    try {
        // Confirm the logged-in user exists and is a patient
        const user = await UserModel.findById(req.user.userId);

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: 'Account unavailable'
            });
        }

        if (user.role !== 'patient') {
            return res.status(403).json({
                message: 'Only patients can create a patient profile'
            });
        }

        // Check whether a profile already exists
        const existingProfile = await PatientModel.findOne({
            userId: user._id
        });

        if (existingProfile) {
            return res.status(409).json({
                message: 'Patient profile already exists'
            });
        }

        // Create the profile using the authenticated user's ID
        const patient = await PatientModel.create({
            userId: user._id,
            dateOfBirth: req.body.dateOfBirth,
            gender: req.body.gender
        });

        return res.status(201).json({
            message: 'Patient profile created successfully',
            patient: {
                userId: user._id,
                fullName: user.fullName,
                dateOfBirth: patient.dateOfBirth.toISOString().split('T')[0], // Format date as YYYY-MM-DD
                age: calculateAge(patient.dateOfBirth),
                gender: patient.gender
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPatientProfile
};