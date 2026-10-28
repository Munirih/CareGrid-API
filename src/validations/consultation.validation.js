const Joi = require('joi');

const createConsultationSchema = Joi.object({
    appointmentId: Joi.string().hex().length(24).required(),
    diagnosis: Joi.string().trim().min(2).max(1000).required(),
    treatmentPlan: Joi.string().trim().min(2).max(2000).required(),
    notes: Joi.string().trim().max(2000).allow('', null).optional(),
    followUpDate: Joi.date().iso().greater('now').allow(null).optional()
});

const validateCreateConsultation = (req, res, next) => {
    const { error, value } = createConsultationSchema.validate(
        req.body
    );

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    req.body = value;
    next();
};

module.exports = {
    validateCreateConsultation
};
