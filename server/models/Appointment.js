const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  specialization: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  date: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  time: { type: String, required: true },
  consultationType: { type: String, enum: ['video', 'audio', 'chat'], required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'accepted', 'rejected', 'completed', 'cancelled'], default: 'pending' },
  symptoms: { type: String },
  notes: { type: String },
  roomId: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, default: '' },
  amountPaid: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

appointmentSchema.pre('save', function(next) {
  this.patientId = this.patientId || this.patient;
  this.doctorId = this.doctorId || this.doctor;
  this.appointmentDate = this.appointmentDate || this.date;
  this.appointmentTime = this.appointmentTime || this.time;
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
