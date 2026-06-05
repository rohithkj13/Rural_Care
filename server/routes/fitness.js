const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getToday, getHistory, updateToday, addFood, removeFood,
  addWorkout, removeWorkout,
  getDoctorPatients, getPatientFitness, setPatientGoals
} = require('../controllers/fitnessController');

// Patient routes
router.get('/today', protect, authorize('patient'), getToday);
router.get('/history', protect, authorize('patient'), getHistory);
router.put('/today', protect, authorize('patient'), updateToday);
router.post('/food', protect, authorize('patient'), addFood);
router.delete('/food/:index', protect, authorize('patient'), removeFood);
router.post('/workout', protect, authorize('patient'), addWorkout);
router.delete('/workout/:index', protect, authorize('patient'), removeWorkout);

// Doctor routes
router.get('/doctor/patients', protect, authorize('doctor'), getDoctorPatients);
router.get('/doctor/patient/:patientId', protect, authorize('doctor'), getPatientFitness);
router.put('/doctor/patient/:patientId/goals', protect, authorize('doctor'), setPatientGoals);

module.exports = router;
