const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const Facility = require('../models/facility.model');
const Intake = require('../models/intake.model');
const Appointment = require('../models/appointment.model');
const calculateAge = require('../utils/calculateAge');

// PHC workers book appointments for patients.
const createAppointment = async (req, res, next) => {
    try {
        const worker = await User.findById(req.user.userId);

        if (
            !worker ||
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
            complaint
        } = req.body;

        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                message: 'Patient not found'
            });
        }

        const intake = await Intake.findById(intakeId);

        if (!intake) {
            return res.status(404).json({
                message: 'Patient intake not found'
            });
        }

        if (intake.patientId.toString() !== patientId) {
            return res.status(400).json({
                message: 'This intake does not belong to the selected patient'
            });
        }

        const facility = await Facility.findById(facilityId);

        if (!facility || !facility.isActive) {
            return res.status(404).json({
                message: 'Active facility not found'
            });
        }

        if (
            !worker.facilityId ||
            worker.facilityId.toString() !== facilityId ||
            !intake.facilityId ||
            intake.facilityId.toString() !== facilityId
        ) {
            return res.status(403).json({
                message: 'Worker, intake and appointment must belong to the same facility'
            });
        }

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

        if (
            !doctor.facilityId ||
            doctor.facilityId.toString() !== facilityId
        ) {
            return res.status(400).json({
                message: 'The doctor must belong to the selected facility'
            });
        }

        const appointmentDate = new Date(scheduledAt);

        if (
            !scheduledAt ||
            Number.isNaN(appointmentDate.getTime()) ||
            appointmentDate <= new Date()
        ) {
            return res.status(400).json({
                message: 'Appointment date must be in the future'
            });
        }

        const appointment = await Appointment.create({
            patientId,
            intakeId,
            doctorId,
            facilityId,
            scheduledAt: appointmentDate,
            reasonForVisit,
            complaint,
            createdBy: worker._id
        });

        const populatedAppointment = await Appointment.findById(
            appointment._id
        )
            .populate('patientId', 'fullName')
            .populate('createdBy', 'fullName')
            .populate('doctorId', 'fullName')
            .populate('facilityId', 'name');

        return res.status(201).json({
            message: 'Appointment booked successfully',
            appointment: populatedAppointment
        });
    } catch (error) {
        next(error);
    }
};

// Doctors view their assigned appointments.
const getDoctorAppointments = async (req, res, next) => {
    try {
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

        const appointments = await Appointment.find({
            doctorId: doctor._id
        })
            .populate('patientId', 'fullName dateOfBirth')
            .populate('createdBy', 'fullName')
            .populate('facilityId', 'name')
            .sort({ scheduledAt: 1 });

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
        next(error);
    }
};

// Doctors update the status of appointments assigned to them.
const updateAppointmentStatus = async (req, res, next) => {
    try {
        const doctor = await User.findById(req.user.userId);

        if (
            !doctor ||
            doctor.role !== 'doctor' ||
            !doctor.isActive ||
            doctor.accountStatus !== 'active'
        ) {
            return res.status(403).json({
                message: 'Only active doctors can update appointments'
            });
        }

        const appointment = await Appointment.findOne({
            _id: req.params.appointmentId,
            doctorId: doctor._id
        });

        if (!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            });
        }

        const allowedStatuses = [
            'scheduled',
            'confirmed',
            'completed',
            'cancelled',
            'no_show'
        ];

        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({
                message: 'Invalid appointment status'
            });
        }

        appointment.status = req.body.status;
        await appointment.save();

        return res.status(200).json({
            message: 'Appointment status updated successfully',
            appointment
        });
    } catch (error) {
        next(error);
    }
};

// Doctors view details of their assigned appointments.
const getAppointmentDetails = async (req, res, next) => {
    try {
        const doctor = await User.findById(req.user.userId);

        if (
            !doctor ||
            doctor.role !== 'doctor' ||
            !doctor.isActive ||
            doctor.accountStatus !== 'active'
        ) {
            return res.status(403).json({
                message: 'Only active doctors can view appointment details'
            });
        }

        const appointment = await Appointment.findOne({
            _id: req.params.appointmentId,
            doctorId: doctor._id
        })
            .populate('patientId', 'fullName dateOfBirth gender')
            .populate(
                'intakeId',
                'clinicalSymptoms bloodPressure temperature notes createdAt'
            )
            .populate('facilityId', 'name')
            .populate('createdBy', 'fullName');

        if (!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            });
        }

        return res.status(200).json({
            message: 'Appointment details retrieved successfully',
            appointment: {
                _id: appointment._id,
                patient: appointment.patientId
                    ? {
                        fullName: appointment.patientId.fullName,
                        age: appointment.patientId.dateOfBirth
                            ? calculateAge(appointment.patientId.dateOfBirth)
                            : null,
                        gender: appointment.patientId.gender
                    }
                    : null,
                intake: appointment.intakeId
                    ? {
                        clinicalSymptoms: appointment.intakeId.clinicalSymptoms,
                        bloodPressure: appointment.intakeId.bloodPressure,
                        temperature: appointment.intakeId.temperature,
                        notes: appointment.intakeId.notes,
                        recordedAt: appointment.intakeId.createdAt
                    }
                    : null,
                facilityName: appointment.facilityId?.name,
                workerName: appointment.createdBy?.fullName,
                complaint: appointment.complaint,
                reasonForVisit: appointment.reasonForVisit,
                scheduledAt: appointment.scheduledAt,
                status: appointment.status,
                createdAt: appointment.createdAt
            }
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid appointment ID'
            });
        }

        next(error);
    }
};

module.exports = {
    createAppointment,
    getDoctorAppointments,
    updateAppointmentStatus,
    getAppointmentDetails
};