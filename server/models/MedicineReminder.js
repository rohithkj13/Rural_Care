const mongoose = require('mongoose');

const medicineReminderSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  reminderType: { type: String, enum: ['medication', 'appointment'], default: 'medication' },
  frequency: { type: String, required: true }, // daily, twice, thrice
  repeat: { type: String, enum: ['none', 'daily', 'weekdays', 'weekly'], default: 'daily' },
  times: [{ type: String }], // ["09:00 AM", "09:00 PM"]
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reminderEnabled: { type: Boolean, default: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicineReminder', medicineReminderSchema);
