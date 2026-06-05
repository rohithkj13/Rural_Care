const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');

exports.createConsultation = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const consultation = await Consultation.create({
      appointment: appointmentId,
      patient: appointment.patient,
      doctor: appointment.doctor,
      startTime: new Date(),
      status: 'ongoing'
    });

    await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });

    res.status(201).json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.endConsultation = async (req, res) => {
  try {
    const { notes } = req.body;
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime - consultation.startTime) / 60000);

    consultation.endTime = endTime;
    consultation.duration = duration;
    consultation.notes = notes;
    consultation.status = 'completed';
    await consultation.save();

    res.status(200).json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConsultations = async (req, res) => {
  try {
    const query = req.user.role === 'patient' 
      ? { patient: req.user.id } 
      : { doctor: req.user.id };

    const consultations = await Consultation.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .populate('appointment')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: consultations.length, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
