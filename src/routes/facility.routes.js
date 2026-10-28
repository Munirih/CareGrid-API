
const express = require('express');
const router = express.Router();

const { createFacility, getFacilities } = require('../controllers/facility.controller');

router.post('/', createFacility);
router.get('/', getFacilities);

module.exports = router;
