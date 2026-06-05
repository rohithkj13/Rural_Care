const express = require('express');
const {
  getAllTests, createTest, updateTest, deleteTest,
  createOrder, getMyOrders, cancelOrder,
  getAllOrders, updateOrderStatus
} = require('../controllers/labTestController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Tests catalog (all authenticated users can view)
router.get('/tests', protect, getAllTests);
router.post('/tests', protect, authorize('admin'), createTest);
router.put('/tests/:id', protect, authorize('admin'), updateTest);
router.delete('/tests/:id', protect, authorize('admin'), deleteTest);

// Patient orders
router.post('/orders', protect, authorize('patient'), createOrder);
router.get('/orders/mine', protect, authorize('patient'), getMyOrders);
router.put('/orders/:id/cancel', protect, authorize('patient'), cancelOrder);

// Admin orders
router.get('/orders', protect, authorize('admin'), getAllOrders);
router.put('/orders/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
