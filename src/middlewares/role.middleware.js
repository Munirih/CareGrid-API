const authorize = (...allowedRoles) => {
return (req, res, next) => {
// Authentication must run before role authorization
if (!req.user || !req.user.userId) {
return res.status(401).json({
message: 'Authentication required'
});
}


    // Ensure at least one permitted role was specified
    if (
        allowedRoles.length === 0 ||
        !allowedRoles.includes(req.user.role)
    ) {
        return res.status(403).json({
            message: 'You do not have permission to access this resource'
        });
    }

    next();
};


};

module.exports = authorize;
