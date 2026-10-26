const express = require('express');
const router = express.Router();
const labController = require('../controllers/lab.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// All lab routes require authentication
router.use(authMiddleware);

// Lab Requests
router
  .route('/requests')
  .post(
    roleMiddleware(['doctor', 'phc_worker']), // adjust roles as needed
    labController.createLabRequest
  )
  .get(labController.getAllLabRequests);

router
  .route('/requests/:id')
  .get(labController.getLabRequestById)
  .patch(
    roleMiddleware(['lab_technician', 'doctor']),
    labController.updateLabRequestStatus
  );

// Lab Reports
router
  .route('/reports')
  .post(
    roleMiddleware(['lab_technician']),
    labController.createLabReport
  )
  .get(labController.getAllLabReports);

router
  .route('/reports/:id')
  .get(labController.getLabReportById)
  .patch(
    roleMiddleware(['lab_technician']),
    labController.updateLabReport
  );

module.exports = router;