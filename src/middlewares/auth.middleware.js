const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authentication required'
        });
    }

    try {
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await UserModel.findById(decoded.userId);

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: 'Account unavailable'
            });
        }
    
        req.user = {
        userId: user._id.toString(),
        role: user.role,
        accountStatus: user.accountStatus
        };

    next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Invalid or expired token'
            });
        }
        next(error);
    }
};

module.exports = authenticate;
