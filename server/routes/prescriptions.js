const express = require('express');
const { createPrescription, getPrescriptions, getPrescriptionById, searchPatient } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/search-patient', protect, authorize('doctor'), searchPatient);
router.post('/', protect, createPrescription);
router.get('/', protect, getPrescriptions);
router.get('/:id', protect, getPrescriptionById);

module.exports = router;
