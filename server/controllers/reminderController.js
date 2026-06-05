const MedicineReminder = require('../models/MedicineReminder');
const Notification = require('../models/Notification');

exports.createReminder = async (req, res) => {
  try {
    const { medicineName, dosage, reminderType, frequency, repeat, times, startDate, endDate, notes } = req.body;
    
    const reminder = await MedicineReminder.create({
      patient: req.user.id,
      medicineName,
      dosage,
      reminderType,
      frequency,
      repeat,
      times,
      startDate,
      endDate,
      notes
    });

    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReminders = async (req, res) => {
  try {
    const reminders = await MedicineReminder.find({ patient: req.user.id })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reminders.length, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReminder = async (req, res) => {
  try {
    const reminder = await MedicineReminder.findOneAndUpdate(
      { _id: req.params.id, patient: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.status(200).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await MedicineReminder.findOne({ _id: req.params.id, patient: req.user.id });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    await reminder.deleteOne();
    res.status(200).json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
