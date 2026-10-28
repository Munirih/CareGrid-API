const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
    try {
        // Read the authorization header
        const authHeader = req.headers.authorization;

        // Ensure a Bearer token is provided
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        const token = authHeader.slice(7).trim();

        // Reject an empty token
        if (!token) {
            return res.status(401).json({
                message: 'Authentication token is missing'
            });
        }

        // Verify the token using the application's secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ensure the token contains the expected user ID
        if (!decoded.userId) {
            return res.status(401).json({
                message: 'Invalid authentication token'
            });
        }

        // Find the user associated with the token
        const user = await UserModel.findById(decoded.userId);

        // Reject missing, inactive, or unavailable accounts
        if (!user || !user.isActive) {
            return res.status(401).json({
                message: 'Account unavailable'
            });
        }

        // Ensure the account has completed the required approval process
        if (user.accountStatus !== 'active') {
            return res.status(403).json({
                message: 'Your account is not approved for access'
            });
        }

        // Make the authenticated user's details available to controllers
req.user = {
    userId: user._id.toString(),
    role: user.role,
    accountStatus: user.accountStatus,
    facilityId: user.facilityId
        ? user.facilityId.toString()
        : null
};

        next();
    } catch (error) {
        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError' ||
            error.name === 'NotBeforeError'
        ) {
            return res.status(401).json({
                message: 'Invalid or expired token'
            });
        }

        // Pass unexpected errors to the central error handler
        next(error);
    }
};

module.exports = authenticate;

