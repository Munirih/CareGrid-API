
const mongoose = require('mongoose');

const FacilitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        facilityType: {
            type: String,
            enum: ['PHC', 'Hospital', 'Laboratory', 'Other'],
            required: true
        },

        address: {
            type: String,
            trim: true,
            maxlength: 300
        },

        city: {
            type: String,
            trim: true,
            maxlength: 100
        },

        state: {
            type: String,
            trim: true,
            maxlength: 100
        },

        country: {
            type: String,
            trim: true,
            maxlength: 100,
            default: 'Nigeria'
        },

        phoneNumber: {
            type: String,
            trim: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Facility', FacilitySchema);
