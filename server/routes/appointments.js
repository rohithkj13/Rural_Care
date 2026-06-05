const express = require('express');
const { createAppointment, getAppointments, getPatientAppointments, getAppointmentById, updateAppointmentStatus, cancelAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createAppointment);
router.get('/patient', protect, getPatientAppointments);
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id/status', protect, updateAppointmentStatus);
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;
