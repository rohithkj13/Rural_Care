const express = require('express');
const { createConsultation, endConsultation, getConsultations } = require('../controllers/consultationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createConsultation);
router.put('/:id/end', protect, endConsultation);
router.get('/', protect, getConsultations);

module.exports = router;
