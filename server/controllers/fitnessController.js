const FitnessLog = require('../models/FitnessLog');
const User = require('../models/User');

// Helper: normalize date to midnight UTC
const dayStart = (d) => {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// GET /api/fitness/today  — patient gets or creates today's log
exports.getToday = async (req, res) => {
  try {
    const today = dayStart(new Date());
    let log = await FitnessLog.findOne({ patient: req.user.id, date: today });
    if (!log) {
      log = await FitnessLog.create({ patient: req.user.id, date: today });
    }
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/fitness/history?days=7  — patient gets last N days
exports.getHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const from = dayStart(new Date(Date.now() - (days - 1) * 86400000));
    const logs = await FitnessLog.find({
      patient: req.user.id,
      date: { $gte: from }
    }).sort({ date: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/fitness/today  — patient updates today's log
exports.updateToday = async (req, res) => {
  try {
    const today = dayStart(new Date());
    const { foodEntries, goals, ...rest } = req.body;

    // Recalculate total calories if food entries provided
    let update = { ...rest };
    if (foodEntries !== undefined) {
      update.foodEntries = foodEntries;
      update.totalCaloriesConsumed = foodEntries.reduce((sum, f) => sum + (f.calories || 0), 0);
    }
    if (goals !== undefined) {
      update.goals = goals;
    }

    const log = await FitnessLog.findOneAndUpdate(
      { patient: req.user.id, date: today },
      { $set: update },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/fitness/workout  — add a workout entry to today
exports.addWorkout = async (req, res) => {
  try {
    const today = dayStart(new Date());
    const entry = req.body;
    const log = await FitnessLog.findOneAndUpdate(
      { patient: req.user.id, date: today },
      {
        $push: { workouts: entry },
        $inc: { caloriesBurned: entry.caloriesBurned || 0 }
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/fitness/workout/:index  — remove a workout entry by index
exports.removeWorkout = async (req, res) => {
  try {
    const today = dayStart(new Date());
    const log = await FitnessLog.findOne({ patient: req.user.id, date: today });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    const idx = parseInt(req.params.index);
    const removed = log.workouts[idx];
    if (!removed) return res.status(404).json({ success: false, message: 'Entry not found' });
    log.workouts.splice(idx, 1);
    log.caloriesBurned = Math.max(0, (log.caloriesBurned || 0) - (removed.caloriesBurned || 0));
    await log.save();
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/fitness/food  — add a food entry to today
exports.addFood = async (req, res) => {
  try {
    const today = dayStart(new Date());
    const entry = req.body;
    const log = await FitnessLog.findOneAndUpdate(
      { patient: req.user.id, date: today },
      {
        $push: { foodEntries: entry },
        $inc: { totalCaloriesConsumed: entry.calories || 0 }
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/fitness/food/:index  — remove a food entry by index
exports.removeFood = async (req, res) => {
  try {
    const today = dayStart(new Date());
    const log = await FitnessLog.findOne({ patient: req.user.id, date: today });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });

    const idx = parseInt(req.params.index);
    const removed = log.foodEntries[idx];
    if (!removed) return res.status(404).json({ success: false, message: 'Entry not found' });

    log.foodEntries.splice(idx, 1);
    log.totalCaloriesConsumed = Math.max(0, log.totalCaloriesConsumed - removed.calories);
    await log.save();
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/fitness/doctor/patients  — doctor sees all assigned patients' latest logs
exports.getDoctorPatients = async (req, res) => {
  try {
    const today = dayStart(new Date());
    const sevenDaysAgo = dayStart(new Date(Date.now() - 6 * 86400000));

    // Find patients who have this doctor assigned
    const patients = await User.find({ role: 'patient', assignedDoctor: req.user.id }, 'name email age gender');

    const result = await Promise.all(patients.map(async (p) => {
      const logs = await FitnessLog.find({
        patient: p._id,
        date: { $gte: sevenDaysAgo }
      }).sort({ date: -1 });
      return { patient: p, logs };
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/fitness/doctor/patient/:patientId  — doctor views one patient's history
exports.getPatientFitness = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 14;
    const from = dayStart(new Date(Date.now() - (days - 1) * 86400000));
    const logs = await FitnessLog.find({
      patient: req.params.patientId,
      date: { $gte: from }
    }).sort({ date: -1 });
    const patient = await User.findById(req.params.patientId, 'name email age gender medicalHistory');
    res.json({ success: true, data: { patient, logs } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/fitness/doctor/patient/:patientId/goals  — doctor sets goals & notes
exports.setPatientGoals = async (req, res) => {
  try {
    const today = dayStart(new Date());
    const { goals, doctorNotes, assignedDoctor } = req.body;

    // Update today's log and also set assignedDoctor on patient
    const log = await FitnessLog.findOneAndUpdate(
      { patient: req.params.patientId, date: today },
      { $set: { goals, doctorNotes, assignedDoctor: req.user.id } },
      { new: true, upsert: true }
    );

    // Persist assignedDoctor on User model
    await User.findByIdAndUpdate(req.params.patientId, { assignedDoctor: req.user.id });

    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
