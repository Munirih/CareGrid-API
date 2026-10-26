
const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const Facility = require('../models/facility.model');
const Intake = require('../models/intake.model');
const Appointment = require('../models/appointment.model');
const calculateAge = require('../utils/calculateAge');

const createAppointment = async (req, res) => {
    try {
        // 1. Find the logged-in worker
        const worker = await User.findById(req.user.userId);

        if (!worker ||
            worker.role !== 'worker' ||
            !worker.isActive ||
            worker.accountStatus !== 'active'
        ) {
            return res.status(403).json({
                message: 'Only active PHC workers can book appointments'
            });
        }

        const {
            patientId,
            intakeId,
            doctorId,
            facilityId,
            scheduledAt,
            reasonForVisit,
            complaint,
        } = req.body;

        // 2. Check that the patient exists
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                message: 'Patient not found'
            });
        }

        // 3. Check that the intake exists
        const intake = await Intake.findById(intakeId);

        if (!intake) {
            return res.status(404).json({
                message: 'Patient intake not found'
            });
        }

        // Ensure the intake belongs to this patient
        if (intake.patientId.toString() !== patientId) {
            return res.status(400).json({
                message: 'This intake does not belong to the selected patient'
            });
        }

        // 4. Check that the facility exists and is active
        const facility = await Facility.findById(facilityId);

        if (!facility || !facility.isActive) {
            return res.status(404).json({
                message: 'Active facility not found'
            });
        }

        // Ensure the worker and intake belong to this facility
        if (
            !worker.facilityId ||
            worker.facilityId.toString() !== facilityId ||
            intake.facilityId.toString() !== facilityId
        ) {
            return res.status(403).json({
                message: 'Worker, intake and appointment must belong to the same facility'
            });
        }

        // 5. Check that the assigned doctor is active
        const doctor = await User.findById(doctorId);

        if (
            !doctor ||
            doctor.role !== 'doctor' ||
            !doctor.isActive ||
            doctor.accountStatus !== 'active'
        ) {
            return res.status(400).json({
                message: 'An active doctor must be selected'
            });
        }

        // Ensure the doctor works at the selected facility
        if (
            !doctor.facilityId ||
            doctor.facilityId.toString() !== facilityId
        ) {
            return res.status(400).json({
                message: 'The doctor must belong to the selected facility'
            });
        }

        // 6. Create the appointment
        const appointment = await Appointment.create({
            patientId,
            intakeId,
            doctorId,
            facilityId,
            scheduledAt,
            reasonForVisit,
            complaint,
            createdBy: worker._id
        });

        // Fetch the appointment with the related names.
        const populatedAppointment = await Appointment.findById(
            appointment._id
        )
            .populate('patientId', 'fullName')
            .populate('createdBy', 'fullName')
            .populate('doctorId', 'fullName')
            .populate('facilityId', 'name');

        return res.status(201).json({
            message: 'Appointment booked successfully',
            appointment: {
                _id: populatedAppointment._id,
                patientName: populatedAppointment.patientId.fullName,
                workerName: populatedAppointment.createdBy.fullName,
                doctorName: populatedAppointment.doctorId.fullName,
                facilityName: populatedAppointment.facilityId.name,
                complaint: populatedAppointment.complaint,
                reasonForVisit: populatedAppointment.reasonForVisit,
                scheduledAt: populatedAppointment.scheduledAt,
                status: populatedAppointment.status,
                createdAt: populatedAppointment.createdAt
            }
        });

    } catch (error) {
        console.error('Create appointment error:', error);

        return res.status(500).json({
            message: 'Failed to book appointment'
        });
    }
};

const getDoctorAppointments = async (req, res) => {
    try {
        // 1. Find the logged-in doctor
        const doctor = await User.findById(req.user.userId);

        if (
            !doctor ||
            doctor.role !== 'doctor' ||
            !doctor.isActive ||
            doctor.accountStatus !== 'active'
        ) {
            return res.status(403).json({
                message: 'Only active doctors can view their appointments'
            });
        }

        // 2. Find appointments assigned to this doctor
        const appointments = await Appointment.find({
            doctorId: doctor._id
        })
            .populate('patientId', 'fullName dateOfBirth')
            .populate('createdBy', 'fullName')
            .populate('facilityId', 'name')
            .sort({ scheduledAt: 1 });

        // 3. Return appointments with patient age
        return res.status(200).json({
            message: 'Doctor appointments retrieved successfully',
            count: appointments.length,

            appointments: appointments.map(appointment => ({
                _id: appointment._id,

                patientName: appointment.patientId?.fullName,

                patientAge: appointment.patientId?.dateOfBirth
                    ? calculateAge(appointment.patientId.dateOfBirth)
                    : null,

                workerName: appointment.createdBy?.fullName,
                facilityName: appointment.facilityId?.name,
                complaint: appointment.complaint,
                reasonForVisit: appointment.reasonForVisit,
                scheduledAt: appointment.scheduledAt,
                status: appointment.status,
                createdAt: appointment.createdAt
            }))
        });

    } catch (error) {
        console.error('Get doctor appointments error:', error);

        return res.status(500).json({
            message: 'Failed to retrieve doctor appointments'
        });
    }
};

module.exports = { createAppointment, getDoctorAppointments };
