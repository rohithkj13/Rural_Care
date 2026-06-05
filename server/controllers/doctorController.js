const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');
const Review = require('../models/Review');

exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    const query = { role: 'doctor', isActive: true };
    if (specialization) query.specialization = specialization;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } }
    ];
    const doctors = await User.find(query).select('-password');
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id).select('-password');
    if (!doctor || doctor.role !== 'doctor')
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDoctorStats = async (req, res) => {
  try {
    const totalPatients = await Appointment.distinct('patient', { doctor: req.user.id });
    const totalConsultations = await Consultation.countDocuments({ doctor: req.user.id, status: 'completed' });
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const todayAppointments = await Appointment.countDocuments({
      doctor: req.user.id, date: { $gte: todayStart, $lt: todayEnd }
    });
    res.json({ success: true, data: { totalPatients: totalPatients.length, totalConsultations, todayAppointments } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id/reviews  — public, returns all reviews for a doctor
exports.getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.id })
      .populate('patient', 'name')
      .sort('-createdAt');
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/reviews/mine  — patient sees their own reviews
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ patient: req.user.id })
      .populate('doctor', 'name specialization')
      .sort('-createdAt');
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/doctors/:id/review
exports.submitReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });

    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== 'doctor')
      return res.status(404).json({ success: false, message: 'Doctor not found.' });

    // Upsert: update if exists, create if not (allows editing own review)
    const existing = await Review.findOne({ doctor: req.params.id, patient: req.user.id });
    if (existing) {
      existing.rating = rating;
      existing.comment = comment || '';
      existing.updatedAt = new Date();
      await existing.save();
    } else {
      await Review.create({ doctor: req.params.id, patient: req.user.id, rating, comment: comment || '' });
    }

    // Recalculate average from all reviews
    const allReviews = await Review.find({ doctor: req.params.id });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    doctor.rating = Math.round(avg * 10) / 10;
    doctor.totalRatings = allReviews.length;
    await doctor.save();

    res.json({ success: true, message: existing ? 'Review updated.' : 'Review submitted.', data: { rating: doctor.rating, totalRatings: doctor.totalRatings } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/doctors/:id/review
exports.deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findOneAndDelete({ doctor: req.params.id, patient: req.user.id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Review not found.' });

    // Recalculate average
    const allReviews = await Review.find({ doctor: req.params.id });
    const doctor = await User.findById(req.params.id);
    if (doctor) {
      doctor.rating = allReviews.length
        ? Math.round((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length) * 10) / 10
        : 0;
      doctor.totalRatings = allReviews.length;
      await doctor.save();
    }
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
