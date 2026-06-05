const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Consultation = require('../models/Consultation');
const Complaint = require('../models/Complaint');
const SymptomLog = require('../models/SymptomLog');
const Notification = require('../models/Notification');
const HealthPost = require('../models/HealthPost');
const BloodDonor = require('../models/BloodDonor');
const BloodRequest = require('../models/BloodRequest');

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [
      totalPatients, totalDoctors, pendingDoctors,
      todayAppointments, pendingAppointments,
      totalPrescriptions, activeConsultations,
      openComplaints, totalSymptomChecks,
      totalHealthFeeds, totalBloodDonors
    ] = await Promise.all([
      User.countDocuments({ role: 'patient', isDisabled: { $ne: true } }),
      User.countDocuments({ role: 'doctor', isApproved: true, isDisabled: { $ne: true } }),
      User.countDocuments({ role: 'doctor', isApproved: false }),
      Appointment.countDocuments({ date: { $gte: todayStart, $lte: todayEnd } }),
      Appointment.countDocuments({ status: 'pending' }),
      Prescription.countDocuments(),
      Consultation.countDocuments({ status: 'ongoing' }),
      Complaint.countDocuments({ status: 'open' }),
      SymptomLog.countDocuments(),
      HealthPost.countDocuments({ isPublished: true }),
      BloodDonor.countDocuments({ isActive: true })
    ]);

    // Last 7 days daily consultations
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setHours(23, 59, 59, 999);
      const count = await Appointment.countDocuments({ date: { $gte: start, $lte: end } });
      last7.push({ date: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), count });
    }

    // Top diagnoses from prescriptions
    const diagnosisAgg = await Prescription.aggregate([
      { $group: { _id: '$diagnosis', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    const recentAppointments = await Appointment.find()
      .sort('-createdAt')
      .limit(5)
      .populate('patient', 'name')
      .populate('doctor', 'name');
    const recentBloodRequests = await BloodRequest.find()
      .sort('-createdAt')
      .limit(5)
      .populate('requestedBy', 'name');
    const recentActivity = [
      ...recentAppointments.map((a) => ({
        type: 'appointment',
        message: `Appointment ${a.status} for ${a.patient?.name || 'patient'} with Dr. ${a.doctor?.name || 'doctor'}`,
        createdAt: a.createdAt
      })),
      ...recentBloodRequests.map((r) => ({
        type: 'blood-request',
        message: `${r.emergency ? 'Emergency ' : ''}blood request (${r.bloodGroup}) by ${r.requestedBy?.name || 'user'}`,
        createdAt: r.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

    res.json({
      success: true,
      data: {
        totalPatients, totalDoctors, pendingDoctors,
        todayAppointments, pendingAppointments,
        totalPrescriptions, activeConsultations,
        openComplaints, totalSymptomChecks, totalHealthFeeds, totalBloodDonors,
        dailyAppointments: last7,
        topDiagnoses: diagnosisAgg.map(d => ({ name: d._id || 'Unknown', count: d.count })),
        recentActivity
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const { type = 'daily', format = 'csv' } = req.query;
    const days = type === 'monthly' ? 30 : 1;
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);

    const [appointments, newPatients, bloodRequests] = await Promise.all([
      Appointment.countDocuments({ createdAt: { $gte: from } }),
      User.countDocuments({ role: 'patient', createdAt: { $gte: from } }),
      BloodRequest.countDocuments({ createdAt: { $gte: from } })
    ]);

    const rows = [
      ['metric', 'value'],
      ['period', type],
      ['appointments', appointments],
      ['new_patients', newPatients],
      ['blood_requests', bloodRequests],
      ['generated_at', new Date().toISOString()]
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');

    if (format === 'excel') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.xlsx`);
      return res.send(csv);
    }
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`);
      return res.send(Buffer.from(`RuralCare ${type} report\n\n${csv}`));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Doctor Management ────────────────────────────────────────────────────────
exports.getAllDoctors = async (req, res) => {
  try {
    const { search, approved } = req.query;
    let query = { role: 'doctor' };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } },
      { hospital: { $regex: search, $options: 'i' } }
    ];
    if (approved === 'false') query.isApproved = false;
    if (approved === 'true') query.isApproved = true;

    const doctors = await User.find(query).select('-password').sort('-createdAt');
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    await Notification.create({
      user: doctor._id,
      title: 'Account Approved',
      message: 'Your doctor account has been approved by admin. You can now receive appointments.',
      type: 'general'
    });

    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const { name, phone, specialization, qualification, experience, hospital, consultationFee } = req.body;
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, specialization, qualification, experience, hospital, consultationFee },
      { new: true, runValidators: true }
    ).select('-password');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await User.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, qualification, experience, hospital, consultationFee } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const doctor = await User.create({
      name, email, password, phone, role: 'doctor',
      specialization, qualification, experience, hospital, consultationFee,
      isApproved: true
    });
    res.status(201).json({ success: true, data: { ...doctor.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Patient Management ───────────────────────────────────────────────────────
exports.getAllPatients = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'patient' };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const patients = await User.find(query).select('-password').sort('-createdAt');
    res.json({ success: true, count: patients.length, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPatientHistory = async (req, res) => {
  try {
    const [appointments, prescriptions] = await Promise.all([
      Appointment.find({ patient: req.params.id })
        .populate('doctor', 'name specialization')
        .sort('-date'),
      Prescription.find({ patient: req.params.id })
        .populate('doctor', 'name specialization')
        .sort('-createdAt')
    ]);
    res.json({ success: true, data: { appointments, prescriptions } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { name, phone, age, gender, address } = req.body;
    const patient = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, age, gender, address },
      { new: true }
    ).select('-password');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.togglePatientStatus = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    patient.isDisabled = !patient.isDisabled;
    await patient.save();
    res.json({ success: true, data: { isDisabled: patient.isDisabled } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Prescription Monitoring ──────────────────────────────────────────────────
exports.getAllPrescriptions = async (req, res) => {
  try {
    const { search } = req.query;
    let prescriptions = await Prescription.find()
      .populate('patient', 'name email age gender')
      .populate('doctor', 'name specialization')
      .sort('-createdAt');

    if (search) {
      const s = search.toLowerCase();
      prescriptions = prescriptions.filter(p =>
        p.patient?.name?.toLowerCase().includes(s) ||
        p.doctor?.name?.toLowerCase().includes(s) ||
        p.diagnosis?.toLowerCase().includes(s)
      );
    }
    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Symptom Logs ─────────────────────────────────────────────────────────────
exports.getSymptomLogs = async (req, res) => {
  try {
    const logs = await SymptomLog.find()
      .populate('patient', 'name email')
      .sort('-createdAt')
      .limit(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Analytics ────────────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    // Daily users (registrations) last 30 days
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Top diseases
    const topDiseases = await Prescription.aggregate([
      { $group: { _id: '$diagnosis', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // Appointments by consultation type
    const byType = await Appointment.aggregate([
      { $group: { _id: '$consultationType', count: { $sum: 1 } } }
    ]);

    // Doctor response time (avg time between appointment creation and status update)
    const doctorStats = await User.aggregate([
      { $match: { role: 'doctor', isApproved: true } },
      { $lookup: { from: 'appointments', localField: '_id', foreignField: 'doctor', as: 'appointments' } },
      { $project: { name: 1, specialization: 1, appointmentCount: { $size: '$appointments' } } },
      { $sort: { appointmentCount: -1 } },
      { $limit: 5 }
    ]);

    // Rural area stats (patients with address)
    const ruralPatients = await User.countDocuments({ role: 'patient', address: { $exists: true, $ne: '' } });
    const totalPatients = await User.countDocuments({ role: 'patient' });

    res.json({
      success: true,
      data: {
        dailyRegistrations: dailyRegistrations.map(d => ({ date: d._id, count: d.count })),
        topDiseases: topDiseases.map(d => ({ name: d._id || 'Unknown', count: d.count })),
        consultationTypes: byType.map(d => ({ type: d._id, count: d.count })),
        topDoctors: doctorStats,
        ruralPatients,
        totalPatients
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Complaints ───────────────────────────────────────────────────────────────
exports.getAllComplaints = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    const complaints = await Complaint.find(query)
      .populate('patient', 'name email phone')
      .sort('-createdAt');
    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.respondToComplaint = async (req, res) => {
  try {
    const { adminResponse, status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { adminResponse, status: status || 'resolved', respondedAt: new Date() },
      { new: true }
    ).populate('patient', 'name email');

    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    await Notification.create({
      user: complaint.patient._id,
      title: 'Complaint Response',
      message: `Your complaint "${complaint.subject}" has been responded to by admin.`,
      type: 'general'
    });

    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Patient creates complaint
exports.createComplaint = async (req, res) => {
  try {
    const { subject, description, category } = req.body;
    const complaint = await Complaint.create({
      patient: req.user.id,
      subject, description, category
    });
    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ patient: req.user.id }).sort('-createdAt');
    res.json({ success: true, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
