const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true
        },

        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            default: null
        },

        symptoms: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 1000
        },

        diagnosis: {
            type: String,
            trim: true,
            default: '',
            maxlength: 2000
        },

        treatmentPlan: {
            type: String,
            trim: true,
            default: '',
            maxlength: 3000
        },

        notes: {
            type: String,
            trim: true,
            default: '',
            maxlength: 3000
        },

        scheduledAt: {
            type: Date,
            default: null
        },

        followUpDate: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: [
                'requested',
                'scheduled',
                'in_progress',
                'completed',
                'cancelled'
            ],
            default: 'requested'
        }
    },
    {
        timestamps: true
    }
);

consultationSchema.index({
    doctorId: 1,
    createdAt: -1
});

module.exports = mongoose.model('Consultation', consultationSchema);