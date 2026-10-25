
const mongoose = require('mongoose');

const AppointmentModel = require('../models/appointment.model');
const PatientModel = require('../models/patient.model');
const UserModel = require('../models/user.model');
const FacilityModel = require('../models/facility.model');

const createAppointment = async (req, res, next) => {
    try {
        // 1. Confirm that the logged-in user is an active PHC worker.
        const worker = await UserModel.findById(req.user.userId);

        if (!worker || !worker.isActive || worker.accountStatus !== 'active') {
            return res.status(403).json({
                message: 'Worker account is not active'
            });
        }

        if (worker.role !== 'worker') {
            return res.status(403).json({
                message: 'Only PHC workers can create appointments'
            });
        }

        // 2. Read the appointment details from the request.
        const {
            patientId,
            doctorId,
            facilityId,
            scheduledAt,
            reasonForVisit
        } = req.body;

        // 3. Validate the supplied IDs.
        if (
            !mongoose.isValidObjectId(patientId) ||
            !mongoose.isValidObjectId(doctorId) ||
            !mongoose.isValidObjectId(facilityId)
        ) {
            return res.status(400).json({
                message: 'Please provide valid patient, doctor, and facility IDs'
            });
        }

        // 4. Confirm that the patient profile exists.
        const patient = await PatientModel.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                message: 'Patient profile not found'
            });
        }

        // 5. Confirm that the doctor is active and has the doctor role.
        const doctor = await UserModel.findOne({
            _id: doctorId,
            role: 'doctor',
            isActive: true,
            accountStatus: 'active'
        });

        if (!doctor) {
            return res.status(400).json({
                message: 'Doctor not found or inactive'
            });
        }

        // 6. Confirm that the facility exists and is active.
        const facility = await FacilityModel.findOne({
            _id: facilityId,
            isActive: true
        });

        if (!facility) {
            return res.status(400).json({
                message: 'Facility not found or inactive'
            });
        }

        // 7. Ensure the doctor is linked to this facility.
        if (
            !doctor.facilityId ||
            doctor.facilityId.toString() !== facilityId
        ) {
            return res.status(400).json({
                message: 'The selected doctor is not linked to this facility'
            });
        }

        // 8. Validate the appointment date and time.
        const appointmentDate = new Date(scheduledAt);

        if (
            typeof scheduledAt !== 'string' ||
            !scheduledAt.trim() ||
            Number.isNaN(appointmentDate.getTime()) ||
            appointmentDate <= new Date()
        ) {
            return res.status(400).json({
                message: 'Please provide a valid future appointment date and time'
            });
        }

        // 9. Validate the reason for the visit.
        if (
            typeof reasonForVisit !== 'string' ||
            reasonForVisit.trim().length < 3 ||
            reasonForVisit.trim().length > 500
        ) {
            return res.status(400).json({
                message: 'Reason for visit must be between 3 and 500 characters'
            });
        }

        // 10. Create the appointment.
        const appointment = await AppointmentModel.create({
            patientId: patient._id,
            doctorId: doctor._id,
            facilityId: facility._id,
            scheduledAt: appointmentDate,
            reasonForVisit: reasonForVisit.trim(),
            createdBy: worker._id
        });

        return res.status(201).json({
            message: 'Appointment created successfully',
            appointment: {
                _id: appointment._id,
                patientId: appointment.patientId,
                doctorId: appointment.doctorId,
                facilityId: appointment.facilityId,
                scheduledAt: appointment.scheduledAt,
                reasonForVisit: appointment.reasonForVisit,
                status: appointment.status,
                createdBy: appointment.createdBy,
                createdAt: appointment.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAppointment
};
