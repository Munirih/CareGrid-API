
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true
        },

        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

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

// Make it easier to find a patient's appointments.
AppointmentSchema.index({
    patientId: 1,
    scheduledAt: 1
});

// Make it easier to find a doctor's appointments.
AppointmentSchema.index({
    doctorId: 1,
    scheduledAt: 1
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
