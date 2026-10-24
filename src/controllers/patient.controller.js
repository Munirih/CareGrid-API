const mongoose = require('mongoose');
const calculateAge = require('../utils/calculateAge');
const PatientModel = require('../models/patient.model');
const UserModel = require('../models/user.model');
const FacilityModel = require('../models/facility.model');


const registerPatientIntake = async (req, res, next) => {
    try {
        // Confirm the logged-in user is an active PHC worker.
        const worker = await UserModel.findById(req.user.userId);

        if (!worker || !worker.isActive ||  worker.accountStatus !== 'active') {
            return res.status(403).json({
                message: 'Worker account is not active'
            });
        }

        if (worker.role !== 'worker') {
            return res.status(403).json({
                message: 'Only PHC workers can register patients'
            });
        }

        if (!worker.facilityId) {
            return res.status(400).json({
                message: 'Your account is not linked to a facility'
            });
        }

        const facility = await FacilityModel.findOne({
            _id: worker.facilityId,
            isActive: true
        });

        if (!facility) {
            return res.status(400).json({
                message: 'Your facility is unavailable'
            });
        }

        const { fullName, dateOfBirth, gender, reasonForVisit, assignedDoctorId } = req.body;

        if (
            typeof fullName !== 'string' ||
            fullName.trim().length < 2
        ) {
            return res.status(400).json({
                message: 'Please provide the patient full name'
            });
        }

        if (
            typeof reasonForVisit !== 'string' ||
            reasonForVisit.trim().length < 3
        ) {
            return res.status(400).json({
                message: 'Please provide the reason for visit'
            });
        }

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

        const allowedGenders = [
            'female',
            'male',
            'other',
            'prefer_not_to_say'
        ];

        if (!allowedGenders.includes(gender)) {
            return res.status(400).json({
                message: 'Please provide a valid gender'
            });
        }

        // Find an active doctor assigned to the same facility.
        if (!mongoose.isValidObjectId(assignedDoctorId)) {
            return res.status(400).json({
                message: 'Please select a valid doctor'
            });
        }

        const doctor = await UserModel.findOne({
            _id: assignedDoctorId,
            role: 'doctor',
            isActive: true,
            accountStatus: 'active',
            facilityId: worker.facilityId
        });

        if (!doctor) {
            return res.status(400).json({
                message: 'Doctor not found, inactive, or not assigned to your facility'
            });
        }

        const patient = await PatientModel.create({
            fullName: fullName.trim(),
            dateOfBirth: dob,
            gender,
            reasonForVisit: reasonForVisit.trim(),
            userId: null,
            facilityId: worker.facilityId,
            registeredBy: worker._id,
            assignedDoctorId: doctor._id
        });

        return res.status(201).json({
            message: 'Patient registered and assigned to a doctor successfully',
            patient: {
                _id: patient._id,
                fullName: patient.fullName,
                dateOfBirth: patient.dateOfBirth.toISOString().slice(0, 10),
                age: calculateAge(patient.dateOfBirth),
                gender: patient.gender,
                reasonForVisit: patient.reasonForVisit,
                facilityId: patient.facilityId,
                registeredBy: patient.registeredBy,
                assignedDoctorId: patient.assignedDoctorId
            }
        });
    } catch (error) {
        next(error);
    }
};


const getPatientProfile = async (req, res, next) => {
    try {
        // Only patients can view their own profiles.
        if (req.user.role !== 'patient') {
            return res.status(403).json({
                message: 'Only patients can view their own profile'
            });
        }

        // Find the profile linked to the logged-in patient.
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

        // Find the facility and assigned doctor.
        const facility = patient.facilityId ? await FacilityModel.findById(patient.facilityId) : null;

        const doctor = patient.assignedDoctorId ? await UserModel.findById(patient.assignedDoctorId) : null;

        
        return res.status(200).json({
            patient: {
                userId: user._id,
                fullName: user.fullName,
                dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.toISOString().split('T')[0] : null,
                age: patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : null,
                gender: patient.gender ?? null,
                facility: facility ? { name: facility.name } : null,
                assignedDoctor: doctor ? { fullName: doctor.fullName } : null
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
                dateOfBirth: patient.dateOfBirth
                    ? patient.dateOfBirth.toISOString().split('T')[0]
                    : null,
                age: patient.dateOfBirth
                    ? calculateAge(patient.dateOfBirth)
                    : null,
                gender: patient.gender ?? null
            }
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getPatientProfile,
    updatePatientProfile,
    registerPatientIntake
};