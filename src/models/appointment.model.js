
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
    {
        // The patient attending the appointment.
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true
        },

        // The clinical intake associated with this visit.
        intakeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Intake',
            required: true
        },

        // The doctor assigned to the appointment.
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // The facility where the appointment will take place.
        facilityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Facility',
            required: true
        },

        scheduledAt: {
            type: Date,
            required: true
        },

        reasonForVisit: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 500
        },

        complaint: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 2000
        },

        status: {
            type: String,
            enum: [
                'scheduled',
                'confirmed',
                'completed',
                'cancelled',
                'no_show'
            ],
            default: 'scheduled'
        },

        // The worker who created the appointment.
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Help retrieve appointments by patient and doctor.
AppointmentSchema.index({
    patientId: 1,
    scheduledAt: 1
});

AppointmentSchema.index({
    doctorId: 1,
    scheduledAt: 1
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
