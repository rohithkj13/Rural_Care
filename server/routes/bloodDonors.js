const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  registerDonor,
  getDonors,
  getMyDonorProfile,
  updateMyDonorProfile,
  updateDonor,
  deleteDonor,
  getBloodStats,
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  getAllRequestsAdmin,
  getAllDonorsAdmin
} = require('../controllers/bloodDonorController');

const router = express.Router();

// Donor routes
router.get('/donors', protect, getDonors);
router.post('/donors', protect, authorize('patient', 'admin'), registerDonor);
router.get('/donors/me', protect, authorize('patient'), getMyDonorProfile);
router.put('/donors/me', protect, authorize('patient'), updateMyDonorProfile);
router.get('/donors/admin', protect, authorize('admin'), getAllDonorsAdmin);
router.put('/donors/:id', protect, authorize('admin'), updateDonor);
router.delete('/donors/:id', protect, authorize('admin'), deleteDonor);

// Stats
router.get('/stats', protect, getBloodStats);

// Request routes — specific paths BEFORE /:id param
router.post('/requests', protect, authorize('patient', 'admin'), createRequest);
router.get('/requests/mine', protect, authorize('patient'), getMyRequests);
router.get('/requests/all', protect, getAllRequests);
router.put('/requests/:id/status', protect, updateRequestStatus);
router.get('/requests', protect, authorize('admin'), getAllRequestsAdmin);

module.exports = router;
