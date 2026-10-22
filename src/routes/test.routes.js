const express = require('express');
const router = express.Router();

const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

router.get(
    '/patient',
    authenticate,
    authorize('patient'),
    (req, res) => {
        res.json({ message: 'Patient access granted' });
    }
);

router.get(
    '/worker',
    authenticate,
    authorize('worker'),
    (req, res) => {
        res.json({ message: 'PHC worker access granted' });
    }
);

router.get(
    '/doctor',
    authenticate,
    authorize('doctor'),
    (req, res) => {
        res.json({ message: 'Doctor access granted' });
    }
);

module.exports = router;
