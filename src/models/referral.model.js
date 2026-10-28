const mongoose = require('mongoose');

// Define the structure of a patient referral
const referralSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },

    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    sourceFacility: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facility',
        required: true
    },

    destinationFacility: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facility',
        required: true
    },

    specialty: {
        type: String,
        trim: true,
        maxlength: 100
    },

    reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },

    clinicalNotes: {
        type: String,
        trim: true,
        maxlength: 3000
    },

    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true });

// Create and export the Referral model
const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;

