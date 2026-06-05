const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodDonor' },
  bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  location: { type: String, required: true },
  units: { type: Number, default: 1, min: 1 },
  purpose: { type: String, default: '' },
  emergency: { type: Boolean, default: false },
  hospitalName: { type: String, default: '' },
  patientCondition: { type: String, default: '' },
  contactPerson: { type: String, default: '' },
  deadline: { type: Date },
  acceptedAt: { type: Date },
  completedAt: { type: Date },
  emergencyLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['open', 'accepted', 'completed', 'cancelled'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
