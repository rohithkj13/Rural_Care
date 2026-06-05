const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');


exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, consultationType, symptoms } = req.body;
    
    const doctor = await require('../models/User').findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      patientId: req.user.id,
      doctor: doctorId,
      doctorId: doctorId,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      date: appointmentDate,
      appointmentDate: appointmentDate,
      time: appointmentTime,
      appointmentTime: appointmentTime,
      consultationType,
      symptoms,
      roomId: Date.now().toString(),
      status: 'pending'
    });

    await Notification.create({
      user: doctorId,
      title: 'New Appointment Request',
      message: `You have a new appointment request from ${req.user.name}`,
      type: 'appointment'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization consultationFee');

    res.status(201).json({ 
      success: true, 
      message: 'Appointment booked successfully',
      appointmentId: appointment._id,
      data: populatedAppointment 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const query = req.user.role === 'patient' 
      ? { patient: req.user.id } 
      : { doctor: req.user.id };

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone age gender')
      .populate('doctor', 'name specialization consultationFee hospital')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone age gender address medicalHistory')
      .populate('doctor', 'name specialization consultationFee hospital qualification');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, runValidators: true }
    ).populate('patient', 'name email').populate('doctor', 'name specialization');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    await Notification.create({
      user: appointment.patient._id,
      title: 'Appointment Status Updated',
      message: `Your appointment has been ${status}`,
      type: 'appointment'
    });

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate('doctor', 'name specialization consultationFee hospital')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
