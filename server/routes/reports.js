const express = require('express');
const { uploadReport, getReports, getReportById, getPatientReports, addDoctorNote, deleteReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadReport);
router.get('/', protect, getReports);
router.get('/patient/:patientId', protect, authorize('doctor'), getPatientReports);
router.get('/:id', protect, getReportById);
router.put('/:id/doctor-note', protect, authorize('doctor'), addDoctorNote);
router.delete('/:id', protect, deleteReport);

module.exports = router;
