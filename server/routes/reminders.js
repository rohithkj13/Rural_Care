const express = require('express');
const { createReminder, getReminders, updateReminder, deleteReminder } = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createReminder);
router.get('/', protect, getReminders);
router.put('/:id', protect, updateReminder);
router.delete('/:id', protect, deleteReminder);

module.exports = router;
