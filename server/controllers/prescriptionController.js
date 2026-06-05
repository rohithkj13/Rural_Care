const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');

exports.createPrescription = async (req, res) => {
  try {
    const { patient, appointment, diagnosis, medicines, advice, followUpDate } = req.body;

    // Verify patient exists
    const patientUser = await require('../models/User').findById(patient);
    if (!patientUser || patientUser.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found with this ID' });
    }
    
    const prescription = await Prescription.create({
      patient,
      doctor: req.user.id,
      appointment: appointment || undefined,
      diagnosis,
      medicines,
      advice,
      followUpDate
    });

    await Notification.create({
      user: patient,
      title: 'New Prescription',
      message: 'You have received a new prescription from your doctor',
      type: 'general'
    });

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patient', 'name email patientId')
      .populate('doctor', 'name specialization');

    res.status(201).json({ success: true, data: populatedPrescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPrescriptions = async (req, res) => {
  try {
    const query = req.user.role === 'patient' 
      ? { patient: req.user.id } 
      : { doctor: req.user.id };

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name email age gender patientId')
      .populate('doctor', 'name specialization')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email age gender patientId')
      .populate('doctor', 'name specialization qualification hospital');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchPatient = async (req, res) => {
  try {
    const { q } = req.query; // search by name, email, or _id
    const User = require('../models/User');
    let query = { role: 'patient' };
    if (q) {
      const isId = q.match(/^[a-f\d]{24}$/i);
      if (isId) {
        query._id = q;
      } else {
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } },
          { patientId: { $regex: q, $options: 'i' } }
        ];
      }
    }
    const patients = await User.find(query, 'name email phone age gender patientId _id').limit(10);
    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
