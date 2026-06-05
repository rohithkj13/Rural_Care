const express = require('express');
const {
  getDashboardStats, getAllDoctors, approveDoctor, updateDoctor, deleteDoctor, addDoctor,
  getAllPatients, getPatientHistory, updatePatient, togglePatientStatus,
  getAllPrescriptions, getSymptomLogs, getAnalytics,
  getAllComplaints, respondToComplaint, createComplaint, getMyComplaints, downloadReport
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const adminOnly = [protect, authorize('admin')];
const patientOnly = [protect, authorize('patient')];

// Dashboard
router.get('/stats', ...adminOnly, getDashboardStats);
router.get('/analytics', ...adminOnly, getAnalytics);
router.get('/reports/download', ...adminOnly, downloadReport);

// Doctor management
router.get('/doctors', ...adminOnly, getAllDoctors);
router.post('/doctors', ...adminOnly, addDoctor);
router.put('/doctors/:id/approve', ...adminOnly, approveDoctor);
router.put('/doctors/:id', ...adminOnly, updateDoctor);
router.delete('/doctors/:id', ...adminOnly, deleteDoctor);

// Patient management
router.get('/patients', ...adminOnly, getAllPatients);
router.get('/patients/:id/history', ...adminOnly, getPatientHistory);
router.put('/patients/:id', ...adminOnly, updatePatient);
router.put('/patients/:id/toggle-status', ...adminOnly, togglePatientStatus);

// Prescriptions
router.get('/prescriptions', ...adminOnly, getAllPrescriptions);

// Symptom logs
router.get('/symptom-logs', ...adminOnly, getSymptomLogs);

// Complaints - admin
router.get('/complaints', ...adminOnly, getAllComplaints);
router.put('/complaints/:id/respond', ...adminOnly, respondToComplaint);

// Complaints - patient
router.post('/complaints', ...patientOnly, createComplaint);
router.get('/complaints/mine', ...patientOnly, getMyComplaints);

module.exports = router;
