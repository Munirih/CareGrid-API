const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema(
  {
    labRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabRequest',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // lab technician
    },
    results: [
      {
        testName: { type: String, required: true },
        value: { type: String, required: true },
        unit: { type: String },
        referenceRange: { type: String },
        flag: {
          type: String,
          enum: ['normal', 'high', 'low', 'critical'],
          default: 'normal',
        },
      },
    ],
    conclusion: { type: String },
    status: {
      type: String,
      enum: ['preliminary', 'final', 'amended'],
      default: 'preliminary',
    },
    reportedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabReport', labReportSchema);