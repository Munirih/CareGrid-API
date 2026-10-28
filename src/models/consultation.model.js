
const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: true,
            unique: true
        },

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

        diagnosis: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 2000
        },

        treatmentPlan: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 2000
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 3000,
            default: ''
        },

        followUpDate: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: ['in_progress', 'completed'],
            default: 'completed'
        }
    },
    {
        timestamps: true
    }
);

ConsultationSchema.index({
    doctorId: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    'Consultation',
    ConsultationSchema
);
