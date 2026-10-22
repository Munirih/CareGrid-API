const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },

        dateOfBirth: {
            type: Date,
            required: true,
            validate: {
                validator: function (value) {
                    return value <= new Date();
                },
                message: 'Date of birth cannot be in the future'
            }
        },

        gender: {
            type: String,
            enum: ['female', 'male', 'other', 'prefer_not_to_say'],
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Patient', PatientSchema);