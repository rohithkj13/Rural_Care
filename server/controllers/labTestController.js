const { LabTest, LabOrder } = require('../models/LabTest');
const Notification = require('../models/Notification');

// ── Lab Tests Catalog ─────────────────────────────────────────────────────────
exports.getAllTests = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };
    if (category && category !== 'all') query.category = category;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    const tests = await LabTest.find(query).sort('name');
    res.json({ success: true, count: tests.length, data: tests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTest = async (req, res) => {
  try {
    const test = await LabTest.create(req.body);
    res.status(201).json({ success: true, data: test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const test = await LabTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, data: test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    await LabTest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Test deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Lab Orders ────────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { testIds, collectionType, collectionAddress, scheduledDate, scheduledTime, notes } = req.body;

    const tests = await LabTest.find({ _id: { $in: testIds } });
    if (!tests.length) return res.status(400).json({ success: false, message: 'No valid tests selected' });

    const orderTests = tests.map(t => ({
      test: t._id,
      name: t.name,
      price: t.discountedPrice || t.price
    }));
    const totalAmount = orderTests.reduce((sum, t) => sum + t.price, 0);

    const order = await LabOrder.create({
      patient: req.user.id,
      tests: orderTests,
      totalAmount,
      collectionType,
      collectionAddress,
      scheduledDate,
      scheduledTime,
      notes
    });

    await Notification.create({
      user: req.user.id,
      title: 'Lab Test Booked',
      message: `Your lab test order has been placed. ${tests.map(t => t.name).join(', ')}`,
      type: 'general'
    });

    const populated = await LabOrder.findById(order._id).populate('tests.test');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await LabOrder.find({ patient: req.user.id })
      .populate('tests.test')
      .sort('-createdAt');
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await LabOrder.findOneAndUpdate(
      { _id: req.params.id, patient: req.user.id, status: 'pending' },
      { status: 'cancelled' },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found or cannot be cancelled' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    const orders = await LabOrder.find(query)
      .populate('patient', 'name email phone')
      .populate('tests.test')
      .sort('-createdAt');
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, reportUrl } = req.body;
    const order = await LabOrder.findByIdAndUpdate(
      req.params.id,
      { status, ...(reportUrl && { reportUrl }) },
      { new: true }
    ).populate('patient', 'name email');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    await Notification.create({
      user: order.patient._id,
      title: 'Lab Test Update',
      message: `Your lab test order status: ${status.replace('_', ' ')}`,
      type: 'general'
    });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
