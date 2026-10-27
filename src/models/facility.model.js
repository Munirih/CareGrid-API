const mongoose = require('mongoose');

// Define the structure of a healthcare facility
const facilitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },

    type: {
        type: String,
        enum: ['PHC', 'hospital', 'specialist_centre', 'laboratory'],
        required: true
    },

    address: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },

    state: {
        type: String,
        required: true,
        trim: true
    },

    phoneNumber: {
        type: String,
        trim: true
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Create and export the Facility model
const Facility = mongoose.model('Facility', facilitySchema);

module.exports = Facility;

