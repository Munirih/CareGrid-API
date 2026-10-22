const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const UserModel = require('../models/user.model')
const { hashPassword } = require('../utils/bcrypt')


const responseUser = (user) => ({
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    accountStatus: user.accountStatus
});

const registerUser = async (req, res, next) => {
    try {
        const { fullName, email, phoneNumber, password, role } = req.body

        const existingUser = await UserModel.findOne({ 
            $or: [
                { email: email.trim().toLowerCase() },
                { phoneNumber: phoneNumber.trim() }
            ] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: "Email or phone number already exists!"
            })
        }
        const hashed = await hashPassword(password)

        const user = new UserModel({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        password: hashed, 
        role: role,
        accountStatus: role === 'patient' ? 'active' : 'pending',
        isActive: true

    })

        await user.save()

        return res.status(201).json({
            message: "Registration successful!"
        })
    }
    catch (error) {
        console.log(error)
        next(error)
    }
};


const loginUser = async (req, res, next) => {
    try {
        const { identifier, password } = req.body

        const normalizedIdentifier = identifier.trim();
        const user = await UserModel.findOne({ 
            $or: [
                { email: normalizedIdentifier.toLowerCase() },
                { phoneNumber: normalizedIdentifier }
            ] 
        }).select('+password');

        if (!user || !user.isActive) {
            return res.status(404).json({ message: "Invalid email/phone number or password"})
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) throw new Error('Invalid credentials')
        console.log("JWT secret loaded during login:", !!process.env.JWT_SECRET);
        
        const token = jwt.sign(
            { userId: user._id, fullName: user.fullName, phoneNumber: user.phoneNumber, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d'}
        );

        

        return res.status(200).json({ message: "Logged in successfully!", user: responseUser(user), token });
    }
    catch (error) {
        console.log(error)
        next(error)
    }
}

const getMe = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.userId);

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: 'Account unavailable'
            });
        }

        return res.status(200).json({
            user: responseUser(user)
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser, loginUser, getMe };