
const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
    {
        // Linked when the patient has an online account.
        // Can be null for a patient registered by a PHC worker.
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        // May be completed later by the patient or an
        // authorized PHC worker.
        dateOfBirth: {
            type: Date,
            validate: {
                validator: function (value) {
                    return !value || value <= new Date();
                },
                message: 'Date of birth cannot be in the future'
            }
        },

        gender: {
            type: String,
            enum: [
                'female',
                'male',
                'other',
                'prefer_not_to_say'
            ]
        },
        assignedDoctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        

        facilityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Facility',
            default: null
        },

        registeredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
         
        reasonForVisit: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 1000
        }
    },
    {
        timestamps: true
    }
);

// Each online user can be linked to at most one patient profile.
// Multiple unclaimed patient profiles can have userId: null.
PatientSchema.index(
    { userId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            userId: { $type: 'objectId' }
        }
    }
);

module.exports = mongoose.model('Patient', PatientSchema);
