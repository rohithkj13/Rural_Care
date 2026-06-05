const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['blood', 'urine', 'imaging', 'cardiac', 'diabetes', 'thyroid', 'liver', 'kidney', 'full-body', 'other'],
    default: 'other'
  },
  description: { type: String },
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  preparationInstructions: { type: String },
  reportTime: { type: String, default: '24 hours' },
  isHomeCollection: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  emoji: { type: String, default: '🧪' },
  createdAt: { type: Date, default: Date.now }
});

const labOrderSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tests: [{
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest', required: true },
    name: { type: String },
    price: { type: Number }
  }],
  totalAmount: { type: Number, required: true },
  collectionType: { type: String, enum: ['home', 'lab'], default: 'home' },
  collectionAddress: { type: String },
  scheduledDate: { type: Date },
  scheduledTime: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'sample_collected', 'processing', 'report_ready', 'cancelled'],
    default: 'pending'
  },
  reportUrl: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  LabTest: mongoose.model('LabTest', labTestSchema),
  LabOrder: mongoose.model('LabOrder', labOrderSchema)
};
