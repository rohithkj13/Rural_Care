const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportType: { type: String, required: true },
  reportName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  description: { type: String },
  aiSummary: { type: String, default: '' },
  doctorNote: { type: String, default: '' },
  doctorNoteBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorNoteAt: { type: Date }
});

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
