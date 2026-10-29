const Joi = require('joi');

// Validate consultation data
const createConsultationSchema = Joi.object({
    symptoms: Joi.string().trim().min(2).max(1000).required(),
    appointmentId: Joi.string().hex().length(24).optional(),
    diagnosis: Joi.string().trim().min(2).max(1000).optional(),
    treatmentPlan: Joi.string().trim().min(2).max(2000).optional(),
    notes: Joi.string().trim().max(2000).allow('', null).optional(),
    followUpDate: Joi.date().iso().greater('now').allow(null).optional()
}).unknown(false);

const validateCreateConsultation = (req, res, next) => {
    const { error, value } = createConsultationSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    req.body = value;
    next();
};

module.exports = {
    createConsultationSchema,
    validateCreateConsultation
};