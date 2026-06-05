const mongoose = require('mongoose');

const bloodDonorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  age: { type: Number, required: true, min: 18, max: 65 },
  weight: { type: Number, min: 40 },
  recentIllness: { type: Boolean, default: false },
  location: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  availability: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
  medicalStatus: { type: String, default: '' },
  lastDonationDate: { type: Date },
  points: { type: Number, default: 0 },
  donationCount: { type: Number, default: 0 },
  badges: [{ type: String }],
  photo: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('BloodDonor', bloodDonorSchema);
