const express = require('express');
const router = express.Router();

const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const {
    createReferral
} = require('../controllers/referral.controller');

const {
    createReferralSchema
} = require('../validations/referral.validation');

// Validate referral data before creating a referral
const validateReferral = (req, res, next) => {
    const { error } = createReferralSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    next();
};

// Only authenticated doctors and workers can create referrals
router.post(
    '/',
    authenticate,
    authorize('doctor', 'worker'),
    validateReferral,
    createReferral
);

module.exports = router;

