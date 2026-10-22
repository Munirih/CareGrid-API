
const User = require('../models/user.model');

const authorize = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.userId);

            if (!user || !user.isActive) {
                return res.status(401).json({
                    message: 'Account unavailable'
                });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    message: 'You do not have permission to access this resource'
                });
            }

            req.user.role = user.role;
            req.user.facilityId = user.facilityId;

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = authorize;
