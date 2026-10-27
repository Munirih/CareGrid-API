const Joi = require('joi');

// Validate a patient's consultation request
const createConsultationSchema = Joi.object({
symptoms: Joi.string()
.trim()
.min(2)
.max(1000)
.required(),


appointmentId: Joi.string()
    .hex()
    .length(24)
    .optional()


}).unknown(false);

module.exports = {
createConsultationSchema
};
