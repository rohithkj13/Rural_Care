const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
  patientId: { type: String, unique: true, sparse: true },
  isApproved: { type: Boolean, default: true },
  isDisabled: { type: Boolean, default: false },
  isDonor: { type: Boolean, default: false },
  donorStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  certificates: [{ type: String }],
  phone: { type: String, required: true },
  
  // Patient specific fields
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: { type: String },
  medicalHistory: { type: String },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Doctor specific fields
  specialization: { type: String },
  qualification: { type: String },
  experience: { type: Number },
  hospital: { type: String },
  consultationFee: { type: Number },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (this.isNew && this.role === 'patient' && !this.patientId) {
    const count = await mongoose.model('User').countDocuments({ role: 'patient' });
    this.patientId = `RC-${String(count + 1).padStart(4, '0')}`;
  }
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
