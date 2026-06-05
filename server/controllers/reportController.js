const MedicalReport = require('../models/MedicalReport');
const Notification = require('../models/Notification');
const path = require('path');
const fs = require('fs');

// Smart rule-based AI summary generator
const generateAISummary = (reportType, reportName, description) => {
  const type = (reportType || '').toLowerCase();
  const name = (reportName || '').toLowerCase();
  const desc = (description || '').toLowerCase();
  const combined = `${type} ${name} ${desc}`;

  const rules = [
    {
      keywords: ['blood', 'cbc', 'hemoglobin', 'hb', 'wbc', 'rbc', 'platelet', 'hba1c', 'sugar', 'glucose', 'lipid', 'cholesterol', 'thyroid', 'tsh', 'vitamin', 'iron', 'ferritin'],
      summary: (rt, rn, d) => `Blood Test Report Overview\n\nThis is a ${rt} report${rn ? ` titled "${rn}"` : ''}. Blood tests measure biochemical markers in your blood to assess organ function, nutritional status, and disease risk.\n\n${d ? `Patient notes: ${d}\n\n` : ''}Key things to know:\n• Hemoglobin/RBC: Indicates oxygen-carrying capacity (low = anemia)\n• WBC count: Reflects immune system activity (high = possible infection)\n• Blood sugar (fasting <100 mg/dL is normal; HbA1c <5.7% is normal)\n• Cholesterol (LDL <100 mg/dL ideal; HDL >60 mg/dL is protective)\n• TSH (0.4–4.0 mIU/L is normal range)\n\n⚠ Values outside normal range need medical evaluation. Please consult your doctor for interpretation specific to your health condition.`
    },
    {
      keywords: ['x-ray', 'xray', 'x ray', 'chest x', 'bone x'],
      summary: (rt, rn, d) => `X-Ray Report Overview\n\nThis is an X-Ray imaging report${rn ? ` for "${rn}"` : ''}. X-rays use low-dose radiation to image bones and dense tissues.\n\n${d ? `Patient notes: ${d}\n\n` : ''}Common findings in X-rays:\n• Fractures or bone density changes\n• Lung conditions (pneumonia, fluid, masses)\n• Heart size and shape\n• Spinal alignment\n\nThe radiologist's report describes any abnormalities found. Your doctor will correlate these findings with your symptoms for diagnosis and treatment planning.`
    },
    {
      keywords: ['ct scan', 'ct-scan', 'computed tomography', 'ctscan'],
      summary: (rt, rn, d) => `CT Scan Report Overview\n\nThis is a CT (Computed Tomography) scan report${rn ? ` for "${rn}"` : ''}. CT scans provide detailed cross-sectional images of organs, bones, and soft tissues.\n\n${d ? `Patient notes: ${d}\n\n` : ''}CT scans are used to diagnose:\n• Internal injuries or bleeding\n• Tumors and masses\n• Blood clots (pulmonary embolism, stroke)\n• Organ conditions (liver, kidney, pancreas)\n\nThe report describes findings region by region. Always review CT results with your specialist for accurate diagnosis.`
    },
    {
      keywords: ['mri', 'magnetic resonance'],
      summary: (rt, rn, d) => `MRI Report Overview\n\nThis is an MRI (Magnetic Resonance Imaging) report${rn ? ` for "${rn}"` : ''}. MRI uses magnetic fields to produce detailed images of soft tissues without radiation.\n\n${d ? `Patient notes: ${d}\n\n` : ''}MRI is particularly useful for:\n• Brain and spinal cord conditions\n• Joint and ligament injuries\n• Soft tissue tumors\n• Abdominal organ assessment\n\nSignal intensities in the report indicate tissue characteristics. Discuss findings with your neurologist or specialist for proper interpretation.`
    },
    {
      keywords: ['urine', 'urinalysis', 'urea', 'creatinine', 'kidney', 'renal'],
      summary: (rt, rn, d) => `Urine / Kidney Function Report Overview\n\nThis is a ${rt} report${rn ? ` titled "${rn}"` : ''}. Urine and kidney function tests evaluate how well your kidneys are filtering waste.\n\n${d ? `Patient notes: ${d}\n\n` : ''}Key markers:\n• Creatinine (normal: 0.6–1.2 mg/dL for adults)\n• Urea/BUN (normal: 7–20 mg/dL)\n• Protein in urine (should be absent/trace)\n• RBCs/WBCs in urine (may indicate infection or kidney disease)\n\nAbnormal values may indicate kidney disease, UTI, or dehydration. Consult your doctor for follow-up.`
    },
    {
      keywords: ['ecg', 'ekg', 'electrocardiogram', 'cardiac', 'heart', 'echo', 'echocardiogram'],
      summary: (rt, rn, d) => `Cardiac Report Overview\n\nThis is a ${rt} report${rn ? ` titled "${rn}"` : ''}. Cardiac tests evaluate the electrical activity and structure of your heart.\n\n${d ? `Patient notes: ${d}\n\n` : ''}What this report may show:\n• Heart rhythm (normal sinus rhythm vs arrhythmia)\n• Heart rate (60–100 bpm is normal)\n• Signs of previous heart attack or ischemia\n• Chamber size and valve function (echo)\n\nAny abnormalities should be reviewed promptly with a cardiologist.`
    },
    {
      keywords: ['prescription', 'medicine', 'medication', 'tablet', 'capsule', 'syrup'],
      summary: (rt, rn, d) => `Prescription Document Overview\n\nThis is a prescription document${rn ? ` titled "${rn}"` : ''}. It contains medications prescribed by your doctor.\n\n${d ? `Patient notes: ${d}\n\n` : ''}Important reminders:\n• Take medicines exactly as prescribed — correct dose, time, and duration\n• Do not stop medicines early even if you feel better\n• Check for drug allergies before starting new medications\n• Store medicines as directed (some need refrigeration)\n• Keep medicines away from children\n\nContact your doctor if you experience side effects or have questions about your prescription.`
    },
  ];

  for (const rule of rules) {
    if (rule.keywords.some(k => combined.includes(k))) {
      return rule.summary(reportType, reportName, description);
    }
  }

  return `Medical Report Overview\n\nThis ${reportType || 'medical'} report${reportName ? ` titled "${reportName}"` : ''} has been uploaded successfully.${description ? `\n\nPatient notes: ${description}` : ''}\n\nThis report contains important health information that should be reviewed by a qualified healthcare professional. Your doctor will analyze this report in context of your medical history, current symptoms, and other diagnostic findings to provide an accurate assessment and appropriate treatment recommendations.\n\nPlease share this report during your next consultation for a thorough review.`;
};

exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { reportType, reportName, description } = req.body;
    const aiSummary = generateAISummary(reportType, reportName, description);

    const report = await MedicalReport.create({
      patient: req.user.id,
      reportType,
      reportName,
      fileUrl: `/uploads/${req.file.filename}`,
      description,
      aiSummary
    });

    const populated = await MedicalReport.findById(report._id)
      .populate('patient', 'name email age gender')
      .populate('doctorNoteBy', 'name specialization');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    // Patients see only their own; doctors see all
    const query = req.user.role === 'patient' ? { patient: req.user.id } : {};

    const reports = await MedicalReport.find(query)
      .populate('patient', 'name email age gender')
      .populate('doctorNoteBy', 'name specialization')
      .sort('-uploadDate');

    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id)
      .populate('patient', 'name email age gender')
      .populate('doctorNoteBy', 'name specialization');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reports/patient/:patientId — doctor fetches a specific patient's reports
exports.getPatientReports = async (req, res) => {
  try {
    const reports = await MedicalReport.find({ patient: req.params.patientId })
      .populate('doctorNoteBy', 'name specialization')
      .sort('-uploadDate');

    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/reports/:id/doctor-note — doctor adds/updates note on a report
exports.addDoctorNote = async (req, res) => {
  try {
    const { doctorNote } = req.body;
    if (!doctorNote || !doctorNote.trim()) {
      return res.status(400).json({ success: false, message: 'Doctor note cannot be empty' });
    }

    const report = await MedicalReport.findByIdAndUpdate(
      req.params.id,
      { doctorNote: doctorNote.trim(), doctorNoteBy: req.user.id, doctorNoteAt: new Date() },
      { new: true }
    ).populate('patient', 'name email').populate('doctorNoteBy', 'name specialization');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Notify patient
    await Notification.create({
      user: report.patient._id,
      title: 'Doctor reviewed your report',
      message: `Dr. ${req.user.name} has added notes to your ${report.reportName} report`,
      type: 'general'
    });

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    await report.deleteOne();
    res.status(200).json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
