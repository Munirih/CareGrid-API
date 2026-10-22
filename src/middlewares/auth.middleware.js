const UserModel = require('../models/user.model');

const jwt = require('jsonwebtoken')

const authenticate = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({error: 'Authentication required' });

    const token = authHeader.replace('Bearer ', '');

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(payload.userId);
         
        if(!user) {
            return res.status(404).json({ message: "User not found" })
        }
        req.user = user;
        next()
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token'})
    }
};

module.exports = authenticate;