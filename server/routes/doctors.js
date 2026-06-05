const express = require('express');
const {
  getAllDoctors, getDoctorById, getDoctorStats,
  submitReview, deleteReview, getDoctorReviews, getMyReviews
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/',                    protect, getAllDoctors);
router.get('/stats',               protect, authorize('doctor'), getDoctorStats);
router.get('/reviews/mine',        protect, authorize('patient'), getMyReviews);
router.get('/:id',                 protect, getDoctorById);
router.get('/:id/reviews',         protect, getDoctorReviews);
router.post('/:id/review',         protect, authorize('patient'), submitReview);
router.delete('/:id/review',       protect, authorize('patient'), deleteReview);

module.exports = router;
