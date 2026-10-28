
const mongoose = require('mongoose');
const calculateAge = require('../utils/calculateAge');
const Patient = require('../models/patient.model');
const User = require('../models/user.model');

// Format patient data consistently.
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

// Check that the logged-in user is an active PHC worker.
const getActiveWorker = async (userId) => {
    const worker = await User.findById(userId);

    if (
        !worker ||
        worker.role !== 'worker' ||
        !worker.isActive ||
        worker.accountStatus !== 'active'
    ) {
        return null;
    }

    return worker;
};

// 1. Register or update a patient profile.
const registerPatientProfile = async (req, res, next) => {
    try {
        const worker = await getActiveWorker(req.user.userId);

        if (!worker) {
            return res.status(403).json({
                message: 'Only active PHC workers can register patients'
            });
        }

        const { patientUserId, dateOfBirth, gender } = req.body;

        const patientUser = await User.findOne({
            _id: patientUserId,
            role: 'patient',
            isActive: true,
            accountStatus: 'active'
        });

        if (!patientUser) {
            return res.status(404).json({
                message: 'Active patient account not found'
            });
        }

        let patient = await Patient.findOne({
            userId: patientUser._id
        });

        const profileExists = Boolean(patient);

        if (!patient) {
            patient = new Patient({
                userId: patientUser._id,
                fullName: patientUser.fullName,
                registeredBy: worker._id
            });
        }

        // Preserve existing values when optional fields are omitted.
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

        return res.status(profileExists ? 200 : 201).json({
            message: profileExists
                ? 'Patient profile updated successfully'
                : 'Patient profile registered successfully',
            patient: formatPatient(patient)
        });
    } catch (error) {
        // Handle a race where two requests create the same profile.
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'A profile already exists for this patient'
            });
        }

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

        const user = await User.findById(req.user.userId);

        if (
            !user ||
            !user.isActive ||
            user.accountStatus !== 'active'
        ) {
            return res.status(403).json({
                message: 'Account unavailable'
            });
        }

        const patient = await Patient.findOne({
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

// 3. PHC worker updates a patient's profile.
const updatePatientProfile = async (req, res, next) => {
    try {
        const worker = await getActiveWorker(req.user.userId);

        if (!worker) {
            return res.status(403).json({
                message: 'Only active PHC workers can update patient profiles'
            });
        }

        const patient = await Patient.findById(
            req.params.patientId
        );

        if (!patient) {
            return res.status(404).json({
                message: 'Patient profile not found'
            });
        }

        const { dateOfBirth, gender } = req.body;

        if (dateOfBirth !== undefined) {
            patient.dateOfBirth =
                dateOfBirth === null || dateOfBirth === ''
                    ? null
                    : new Date(`${dateOfBirth}T00:00:00.000Z`);
        }

        if (gender !== undefined) {
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

// 4. PHC worker views the patient list.
const getAllPatients = async (req, res, next) => {
    try {
        const worker = await getActiveWorker(req.user.userId);

        if (!worker) {
            return res.status(403).json({
                message: 'Only active PHC workers can view all patients'
            });
        }

        const patients = await Patient.find()
            .sort({ createdAt: -1 })
            .select(
                '_id userId fullName dateOfBirth gender registeredBy createdAt'
            );

        const patientList = patients.map(patient => ({
            ...formatPatient(patient),
            createdAt: patient.createdAt
        }));

        return res.status(200).json({
            count: patientList.length,
            patients: patientList
        });
    } catch (error) {
        next(error);
    }
};

// Search for existing patient accounts.
const searchPatientAccounts = async (req, res, next) => {
    try {
        // Check that the logged-in user is an active worker.
        const worker = await User.findById(req.user.userId);

        if (
            !worker ||
            worker.role !== 'worker' ||
            !worker.isActive ||
            worker.accountStatus !== 'active'
        ) {
            return res.status(403).json({
                message: 'Only active PHC workers can search patients'
            });
        }

        // Get the search term from the URL.
        const name = req.query.q?.trim();

        if (!name || name.length < 2) {
            return res.status(400).json({
                message: 'Enter at least 2 characters to search'
            });
        }

        if (name.length > 100) {
            return res.status(400).json({
                message: 'Search term is too long'
            });
        }

        // Escape special regex characters in the search term.
        const safeSearch = name.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
        );

        // Search by name, email, or phone number.
        const patients = await User.find({
            role: 'patient',
            isActive: true,
            accountStatus: 'active',
            $or: [
                { fullName: { $regex: safeSearch, $options: 'i' } },
                { email: { $regex: safeSearch, $options: 'i' } },
                { phoneNumber: { $regex: safeSearch } }
            ]
        })
            .select('_id fullName email phoneNumber')
            .limit(10);

        return res.status(200).json({
            count: patients.length,
            patients
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    registerPatientProfile,
    getPatientProfile,
    updatePatientProfile,
    getAllPatients,
    searchPatientAccounts
};
