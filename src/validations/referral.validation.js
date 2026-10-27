const Joi = require('joi');

// Validate data submitted when creating a referral
const createReferralSchema = Joi.object({
    patientId: Joi.string().hex().length(24).required(),
    sourceFacility: Joi.string().hex().length(24).required(),
    destinationFacility: Joi.string().hex().length(24).required(),
    specialty: Joi.string().trim().max(100).optional(),
    reason: Joi.string().trim().min(2).max(1000).required(),
    clinicalNotes: Joi.string().trim().max(3000).optional()
}).unknown(false);

module.exports = { createReferralSchema };