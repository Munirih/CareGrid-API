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
                dateOfBirth: patient.dateOfBirth.toISOString().split('T')[0], // Format date as YYYY-MM-DD
                gender: patient.gender
            }
        });
    } catch (error) {
        next(error);
    }
};


const getPatientProfile = async (req, res, next) => {
    try {
        // Find the profile belonging to the logged-in user
        const patient = await PatientModel.findOne({
            userId: req.user.userId
        });

        if (!patient) {
            return res.status(404).json({
                message: 'Patient profile not found'
            });
        }

        // Retrieve the patient's account details
        const user = await UserModel.findById(req.user.userId);

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: 'Account unavailable'
            });
        }

        return res.status(200).json({
            patient: {
                userId: user._id,
                fullName: user.fullName,
                dateOfBirth: patient.dateOfBirth
                    .toISOString()
                    .split('T')[0],
                age: calculateAge(patient.dateOfBirth),
                gender: patient.gender
            }
        });
    } catch (error) {
        next(error);
    }
};



const updatePatientProfile = async (req, res, next) => {
    try {
        // Confirm that the logged-in user is a patient.
        if (req.user.role !== 'patient') {
            return res.status(403).json({
                message: 'Only patients can update a patient profile'
            });
        }

        // Find the patient's own profile using their token.
        const patient = await PatientModel.findOne({
            userId: req.user.userId
        });

        if (!patient) {
            return res.status(404).json({
                message: 'Patient profile not found'
            });
        }

        const { dateOfBirth, gender } = req.body;

        // Update only fields that were provided.
        if (dateOfBirth !== undefined) {
            const dob = new Date(dateOfBirth);

            if (
                typeof dateOfBirth !== 'string' ||
                !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ||
                Number.isNaN(dob.getTime()) ||
                dob.toISOString().slice(0, 10) !== dateOfBirth ||
                dob > new Date()
            ) {
                return res.status(400).json({
                    message: 'Please provide a valid date of birth'
                });
            }

            patient.dateOfBirth = dob;
        }

        if (gender !== undefined) {
            const allowedGenders = [
                'female',
                'male',
                'other',
                'prefer_not_to_say'
            ];

            if (!allowedGenders.includes(gender)) {
                return res.status(400).json({
                    message: 'Invalid gender value'
                });
            }

            patient.gender = gender;
        }

        // Do not accept an empty update.
        if (dateOfBirth === undefined && gender === undefined) {
            return res.status(400).json({
                message: 'Provide at least one field to update'
            });
        }

        await patient.save();

        // Fetch the user's name from the User collection.
        const user = await UserModel.findById(req.user.userId);

        return res.status(200).json({
            message: 'Patient profile updated successfully',
            patient: {
                userId: user._id,
                fullName: user.fullName,
                dateOfBirth: patient.dateOfBirth.toISOString().slice(0, 10),
                age: calculateAge(patient.dateOfBirth),
                gender: patient.gender
            }
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createPatientProfile,
    getPatientProfile,
    updatePatientProfile
};