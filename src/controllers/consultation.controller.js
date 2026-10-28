
const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const Consultation = require('../models/consultation.model');

// Create a consultation for an existing appointment.
const createConsultation = async (req, res, next) => {
    try {
        // 1. Check that the logged-in doctor is active.
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

        // 2. Find the existing appointment.
        const appointment = await Appointment.findById(
            appointmentId
        );

        if (!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            });
        }

        // 3. Ensure this appointment belongs to the doctor.
        if (
            appointment.doctorId.toString() !==
            doctor._id.toString()
        ) {
            return res.status(403).json({
                message: 'You are not assigned to this appointment'
            });
        }

        // 4. Only allow consultations for confirmed appointments.
        if (appointment.status !== 'confirmed') {
            return res.status(400).json({
                message: 'Appointment must be confirmed first'
            });
        }

        // 5. Prevent a duplicate consultation.
        const existingConsultation =
            await Consultation.findOne({ appointmentId });

        if (existingConsultation) {
            return res.status(409).json({
                message: 'A consultation already exists for this appointment'
            });
        }

        // 6. Create the consultation.
        const consultation = await Consultation.create({
            appointmentId: appointment._id,
            patientId: appointment.patientId,
            doctorId: doctor._id,
            diagnosis,
            treatmentPlan,
            notes,
            followUpDate
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
    createConsultation
};
