const Joi = require('joi');

const registerValidationSchema = Joi.object({
    fullName: Joi.string().min(2).required().trim().max(100),
    email: Joi.string().email().required().lowercase().trim(),
    phoneNumber: Joi.string().required().trim().pattern(/^\+?[0-9]{7,15}$/),
    password: Joi.string().required().min(6).max(100),
    role: Joi.string().valid('patient', 'doctor', 'phc worker').required(),
    accountStatus: Joi.string().valid('pending', 'active', 'rejected').default('pending'),
    isActive: Joi.boolean().default(true)

});

const loginValidationSchema = Joi.object({
        identifier: Joi.string().required().trim(),
        password: Joi.string().required()
    });


const validateRegister = (req, res, next) => {
    const {error} = registerValidationSchema.validate(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    next();
}


const validateLogin = (req, res, next) => {
    const {error} = loginValidationSchema.validate(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    next();
}

module.exports = {
    validateRegister,
    validateLogin
}