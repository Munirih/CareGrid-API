
const express = require('express');
const authenticate = require('../middlewares/auth.middleware');

const { createAppointment } = require('../controllers/appointment.controller');

const router = express.Router();

router.post('/', authenticate, createAppointment);

module.exports = router;
