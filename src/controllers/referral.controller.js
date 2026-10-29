const Referral = require('../models/referral.model');
const Patient = require('../models/patient.model');
const Facility = require('../models/facility.model');

// Create a referral for a patient
const createReferral = async (req, res, next) => {
    try {
        // Only doctors and healthcare workers can initiate referrals
        if (!['doctor', 'worker'].includes(req.user.role)) {
            return res.status(403).json({
                message: 'Only doctors and healthcare workers can create referrals'
            });
        }

        const {
            patientId,
            sourceFacility,
            destinationFacility,
            specialty,
            reason,
            clinicalNotes
        } = req.body;

        // Confirm that the patient exists
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                message: 'Patient not found'
            });
        }

        // Confirm that both facilities exist and are active
        const source = await Facility.findOne({
            _id: sourceFacility,
            isActive: true
        });

        const destination = await Facility.findOne({
            _id: destinationFacility,
            isActive: true
        });

        if (!source || !destination) {
            return res.status(404).json({
                message: 'Source or destination facility not found or inactive'
            });
        }

        // Ensure the user can only refer patients from their assigned facility
if (!req.user.facilityId ||
    req.user.facilityId.toString() !== source._id.toString()) {
    return res.status(403).json({
        message: 'You are not authorized to create referrals for this facility'
    });
}

        // Prevent referrals to the same facility
        if (source._id.equals(destination._id)) {
            return res.status(400).json({
                message: 'Source and destination facilities must be different'
            });
        }

        // Save the referral using the logged-in user's ID
        const referral = await Referral.create({
            patientId: patient._id,
            referredBy: req.user.userId,
            sourceFacility: source._id,
            destinationFacility: destination._id,
            specialty,
            reason,
            clinicalNotes
        });

        return res.status(201).json({
            message: 'Referral created successfully',
            referral
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createReferral };

