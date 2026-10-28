const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    role: {
        type: String,
        enum: ['patient', 'doctor', 'worker'],
        required: true,
    },

    facilityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facility',
        default: null
    },

    isActive: {
        type: Boolean,
        default: true
    },

    accountStatus: {
        type: String,
        enum: [ 'pending', 'active', 'rejected' ],
        default: 'active',
        required: true
        },
},
{ timestamps: true } 
);

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel;