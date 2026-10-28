
const mongoose = require('mongoose');

const UserModel = require('../models/user.model');
const PatientModel = require('../models/patient.model');
const FacilityModel = require('../models/facility.model');
const IntakeModel = require('../models/intake.model');

const createIntake = async (req, res, next) => {
    try {
        // 1. Find the logged-in worker.
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
                message: 'Only PHC workers can create intakes'
            });
        }

        // 2. Get the intake information from the request.
        const {
            patientId,
            facilityId,
            clinicalSymptoms,
            bloodPressure,
            temperature,
            notes
        } = req.body;

        // 3. Verify that the patient profile exists.
        if (!mongoose.isValidObjectId(patientId)) {
            return res.status(400).json({
                message: 'Invalid patient ID'
            });
        }

        const patient = await PatientModel.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                message: 'Patient profile not found'
            });
        }

        // 4. Verify that the facility exists and is active.
        if (!mongoose.isValidObjectId(facilityId)) {
            return res.status(400).json({
                message: 'Invalid facility ID'
            });
        }

        const facility = await FacilityModel.findOne({
            _id: facilityId,
            isActive: true
        });

        if (!facility) {
            return res.status(404).json({
                message: 'Active facility not found'
            });
        }

        // 5. Ensure the worker belongs to this facility.
        if (
            !worker.facilityId ||
            worker.facilityId.toString() !== facility._id.toString()
        ) {
            return res.status(403).json({
                message: 'You are not assigned to this facility'
            });
        }

        // 6. Create a new intake for this visit.
        const intake = await IntakeModel.create({
            patientId: patient._id,
            recordedBy: worker._id,
            facilityId: facility._id,
            clinicalSymptoms: clinicalSymptoms.trim(),
            bloodPressure:
                bloodPressure && bloodPressure.trim()
                    ? bloodPressure.trim()
                    : null,
            temperature:
                temperature === undefined ||
                temperature === null ||
                temperature === ''
                    ? null
                    : Number(temperature),
            notes: notes ? notes.trim() : ''
        });

        // 7. Return the saved intake.
        return res.status(201).json({
            message: 'Patient intake recorded successfully',
            intake: {
                _id: intake._id,
                patientId: intake.patientId,
                recordedBy: intake.recordedBy,
                facilityId: intake.facilityId,
                clinicalSymptoms: intake.clinicalSymptoms,
                bloodPressure: intake.bloodPressure,
                temperature: intake.temperature,
                notes: intake.notes,
                createdAt: intake.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createIntake
};
