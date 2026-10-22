const Joi = require('joi');

const registerValidationSchema = Joi.object({
    fullName: Joi.string().min(2).required().trim().max(100),
    email: Joi.string().email().required().lowercase().trim(),
    phoneNumber: Joi.string().required().trim().pattern(/^\+?[0-9]{7,15}$/),
    password: Joi.string().required().min(6).max(100),
    role: Joi.string().valid('patient', 'doctor', 'worker').required(),
});

const loginValidationSchema = Joi.object({
        identifier: Joi.string().required().trim(),
        password: Joi.string().required()
    });


const validateRegister = (req, res, next) => {
    const {error, value } = registerValidationSchema.validate(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    req.body = value;
    next();
}


const validateLogin = (req, res, next) => {
    const {error, value } = loginValidationSchema.validate(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    req.body = value;
    next();
}

module.exports = {
    validateRegister,
    validateLogin
}