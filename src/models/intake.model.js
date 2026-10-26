
const mongoose = require('mongoose');

const IntakeSchema = new mongoose.Schema(
    {
        // The patient this intake belongs to.
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true,
            index: true
        },

        // The PHC worker who recorded the intake.
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // The facility where the intake took place.
        facilityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Facility',
            required: true
        },

        // Symptoms reported by the patient.
        clinicalSymptoms: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 2000
        },

        // Optional clinical observations.
        bloodPressure: {
            type: String,
            trim: true,
            default: null
        },

        temperature: {
            type: Number,
            min: 25,
            max: 45,
            default: null
        },

        // Additional observations recorded by the worker.
        notes: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ''
        },

        status: {
            type: String,
            enum: ['completed'],
            default: 'completed'
        }
    },
    {
        timestamps: true
    }
);

// Retrieve a patient's intake history in date order.
IntakeSchema.index({
    patientId: 1,
    createdAt: -1
});

module.exports = mongoose.model('Intake', IntakeSchema);
