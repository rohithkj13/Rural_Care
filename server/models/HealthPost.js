const mongoose = require('mongoose');

const healthPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  category: {
    type: String,
    enum: ['nutrition', 'fitness', 'mental-health', 'disease-prevention', 'women-health', 'child-health', 'senior-health', 'general', 'heart-health', 'diabetes', 'seasonal-alert', 'government-update'],
    default: 'general'
  },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  coverEmoji: { type: String, default: '🏥' },
  tags: [{ type: String }],
  author: { type: String, default: 'RuralCare Medical Team' },
  authorRole: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  readTime: { type: Number, default: 3 },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

healthPostSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('HealthPost', healthPostSchema);
