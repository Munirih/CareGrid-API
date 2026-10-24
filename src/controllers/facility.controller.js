
const Facility = require('../models/facility.model');

// Create a healthcare facility
const createFacility = async (req, res) => {
    try {
        const { name, facilityType, address, city, state, country, phoneNumber } = req.body;

        const facility = await Facility.create({ name, facilityType, address, city, state, country, phoneNumber});

        return res.status(201).json({
            message: 'Facility created successfully',
            facility
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

// Get all active healthcare facilities
const getFacilities = async (req, res) => {
    try {
        const facilities = await Facility.find({ isActive: true });

        return res.status(200).json({
            count: facilities.length,
            facilities
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve facilities'
        });
    }
};

module.exports = {
    createFacility,
    getFacilities
};
