const mongoose = require('mongoose');

const symptomLogSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  symptoms: [{ type: String }],
  prediction: { type: String },
  confidence: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SymptomLog', symptomLogSchema);
