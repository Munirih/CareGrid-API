const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const Appointment = require('../models/appointment.model');
const Consultation = require('../models/consultation.model');

// Patients request consultations by describing their symptoms.
const requestConsultation = async (req, res, next) => {
    try {
        const patient = await Patient.findOne({
            userId: req.user.userId
        });

        if (!patient) {
            return res.status(404).json({
                message: 'Patient profile not found'
            });
        }

        const consultation = await Consultation.create({
            patientId: patient._id,
            symptoms: req.body.symptoms,
            appointmentId: req.body.appointmentId || null,
            status: 'requested'
        });

        return res.status(201).json({
            message: 'Consultation requested successfully',
            consultation
        });
    } catch (error) {
        next(error);
    }
};

// Doctors record clinical consultations for their appointments.
const createConsultation = async (req, res, next) => {
    try {
        const doctor = await User.findById(req.user.userId);

        if (
            !doctor ||
            doctor.role !== 'doctor' ||
            !doctor.isActive ||
            doctor.accountStatus !== 'active'
        ) {
            return res.status(403).json({
                message: 'Only active doctors can create consultations'
            });
        }

        const {
            appointmentId,
            diagnosis,
            treatmentPlan,
            notes,
            followUpDate
        } = req.body;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            });
        }

        if (appointment.doctorId.toString() !== doctor._id.toString()) {
            return res.status(403).json({
                message: 'You are not assigned to this appointment'
            });
        }

        if (appointment.status !== 'confirmed') {
            return res.status(400).json({
                message: 'Appointment must be confirmed first'
            });
        }

        const existingConsultation = await Consultation.findOne({
            appointmentId
        });

        if (existingConsultation) {
            return res.status(409).json({
                message: 'A consultation already exists for this appointment'
            });
        }

        const consultation = await Consultation.create({
            appointmentId: appointment._id,
            patientId: appointment.patientId,
            doctorId: doctor._id,
            symptoms: req.body.symptoms || 'Not recorded',
            diagnosis,
            treatmentPlan,
            notes,
            followUpDate,
            status: 'completed'
        });

        return res.status(201).json({
            message: 'Consultation created successfully',
            consultation
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    requestConsultation,
    createConsultation
};