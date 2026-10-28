const LabRequest = require('../models/labRequest.model');
const LabReport = require('../models/labReport.model');

// ---------- Lab Request ----------
exports.createLabRequest = async (req, res, next) => {
  try {
    const labRequest = await LabRequest.create({
      ...req.body,
      requestedBy: req.user._id, // assuming auth middleware sets req.user
    });
    res.status(201).json({ status: 'success', data: labRequest });
  } catch (err) {
    next(err);
  }
};

exports.getAllLabRequests = async (req, res, next) => {
  try {
    const requests = await LabRequest.find()
      .populate('patient', 'firstName lastName')
      .populate('requestedBy', 'name');
    res.status(200).json({ status: 'success', data: requests });
  } catch (err) {
    next(err);
  }
};

exports.getLabRequestById = async (req, res, next) => {
  try {
    const request = await LabRequest.findById(req.params.id)
      .populate('patient')
      .populate('requestedBy');
    if (!request) {
      return res.status(404).json({ status: 'fail', message: 'Lab request not found' });
    }
    res.status(200).json({ status: 'success', data: request });
  } catch (err) {
    next(err);
  }
};

exports.updateLabRequestStatus = async (req, res, next) => {
  try {
    const request = await LabRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!request) {
      return res.status(404).json({ status: 'fail', message: 'Lab request not found' });
    }
    res.status(200).json({ status: 'success', data: request });
  } catch (err) {
    next(err);
  }
};

// ---------- Lab Report ----------
exports.createLabReport = async (req, res, next) => {
  try {
    const report = await LabReport.create({
      ...req.body,
      performedBy: req.user._id,
    });
    // Optionally update the linked LabRequest status to 'completed'
    await LabRequest.findByIdAndUpdate(req.body.labRequest, { status: 'completed' });
    res.status(201).json({ status: 'success', data: report });
  } catch (err) {
    next(err);
  }
};

exports.getAllLabReports = async (req, res, next) => {
  try {
    const reports = await LabReport.find()
      .populate('patient', 'firstName lastName')
      .populate('labRequest', 'tests status')
      .populate('performedBy', 'name');
    res.status(200).json({ status: 'success', data: reports });
  } catch (err) {
    next(err);
  }
};

exports.getLabReportById = async (req, res, next) => {
  try {
    const report = await LabReport.findById(req.params.id)
      .populate('patient')
      .populate('labRequest')
      .populate('performedBy');
    if (!report) {
      return res.status(404).json({ status: 'fail', message: 'Lab report not found' });
    }
    res.status(200).json({ status: 'success', data: report });
  } catch (err) {
    next(err);
  }
};

exports.updateLabReport = async (req, res, next) => {
  try {
    const report = await LabReport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!report) {
      return res.status(404).json({ status: 'fail', message: 'Lab report not found' });
    }
    res.status(200).json({ status: 'success', data: report });
  } catch (err) {
    next(err);
  }
};