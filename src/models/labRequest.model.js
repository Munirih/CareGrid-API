const mongoose = require('mongoose');

const labRequestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // doctor or PHC worker
      required: true,
    },
    tests: [
      {
        name: { type: String, required: true },
        code: { type: String },
        priority: {
          type: String,
          enum: ['routine', 'urgent', 'stat'],
          default: 'routine',
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    clinicalNotes: { type: String },
    requestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabRequest', labRequestSchema);