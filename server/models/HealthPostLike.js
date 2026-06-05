const mongoose = require('mongoose');

const healthPostLikeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthPost', required: true, index: true }
}, { timestamps: true });

healthPostLikeSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('HealthPostLike', healthPostLikeSchema);
