import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { prescriptionAPI } from '../services/api';
import { FaFileMedical, FaDownload, FaPrint, FaTimes } from 'react-icons/fa';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPrescriptions(); }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await prescriptionAPI.getAll();
      setPrescriptions(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally { setLoading(false); }
  };

  const handlePrintPDF = (presc) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${presc._id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
          .clinic-name { font-size: 24px; font-weight: bold; color: #16a34a; }
          .clinic-sub { font-size: 12px; color: #666; margin-top: 4px; }
          .rx-symbol { font-size: 48px; color: #16a34a; font-weight: bold; }
          .doctor-info { background: #f0fdf4; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }
          .doctor-info h3 { font-size: 18px; color: #15803d; }
          .patient-section { display: flex; gap: 40px; margin-bottom: 20px; padding: 12px 16px; background: #f9fafb; border-radius: 8px; }
          .patient-section div { flex: 1; }
          .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { font-size: 14px; font-weight: 600; color: #111; margin-top: 2px; }
          .section-title { font-size: 13px; font-weight: bold; color: #16a34a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; margin-top: 20px; border-bottom: 1px solid #d1fae5; padding-bottom: 4px; }
          .diagnosis-box { background: #fef9c3; border-left: 4px solid #eab308; padding: 10px 14px; border-radius: 4px; font-size: 14px; }
          .medicine-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          .medicine-table th { background: #16a34a; color: white; padding: 8px 12px; text-align: left; font-size: 12px; }
          .medicine-table td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
          .medicine-table tr:nth-child(even) td { background: #f9fafb; }
          .advice-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 10px 14px; border-radius: 4px; font-size: 13px; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          .signature-line { border-top: 1px solid #333; width: 160px; text-align: center; padding-top: 4px; font-size: 12px; color: #666; }
          .watermark { text-align: center; color: #d1d5db; font-size: 11px; margin-top: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="clinic-name">🏥 RuralCare Connect</div>
            <div class="clinic-sub">Digital Telemedicine Platform · Making Healthcare Accessible</div>
          </div>
          <div class="rx-symbol">℞</div>
        </div>

        <div class="doctor-info">
          <h3>Dr. ${presc.doctor?.name || 'N/A'}</h3>
          <div style="font-size:13px; color:#555; margin-top:4px;">${presc.doctor?.specialization || ''} · ${presc.doctor?.qualification || ''}</div>
          <div style="font-size:12px; color:#888; margin-top:2px;">${presc.doctor?.hospital || ''}</div>
        </div>

        <div class="patient-section">
          <div>
            <div class="label">Patient Name</div>
            <div class="value">${presc.patient?.name || 'N/A'}</div>
          </div>
          <div>
            <div class="label">Date</div>
            <div class="value">${new Date(presc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <div>
            <div class="label">Prescription ID</div>
            <div class="value" style="font-size:11px;">${presc._id}</div>
          </div>
        </div>

        <div class="section-title">Diagnosis</div>
        <div class="diagnosis-box">${presc.diagnosis}</div>

        <div class="section-title">Medicines Prescribed</div>
        <table class="medicine-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Medicine Name</th>
              <th>Dosage</th>
              <th>Duration</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${presc.medicines.map((m, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${m.name}</strong></td>
                <td>${m.dosage}</td>
                <td>${m.duration}</td>
                <td>${m.instructions}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${presc.advice ? `
          <div class="section-title">Doctor's Advice</div>
          <div class="advice-box">${presc.advice}</div>
        ` : ''}

        ${presc.followUpDate ? `
          <div style="margin-top:16px; font-size:13px; color:#7c3aed; font-weight:600;">
            📅 Follow-up Date: ${new Date(presc.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        ` : ''}

        <div class="footer">
          <div style="font-size:12px; color:#888;">
            <div>This is a digitally generated prescription.</div>
            <div>Valid for 30 days from date of issue.</div>
          </div>
          <div class="signature-line">
            Dr. ${presc.doctor?.name || 'N/A'}<br/>Doctor's Signature
          </div>
        </div>
        <div class="watermark">Generated by RuralCare Connect · Digital Health Platform</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/patient/dashboard" className="text-2xl font-bold text-primary">RuralCare Connect</Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link to="/patient/dashboard" className="hover:text-primary">Dashboard</Link>
            <Link to="/patient/doctors" className="hover:text-primary">Doctors</Link>
            <Link to="/patient/appointments" className="hover:text-primary">Appointments</Link>
            <Link to="/patient/prescriptions" className="text-primary border-b-2 border-primary pb-1">Prescriptions</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <FaFileMedical className="text-primary" /> My Prescriptions
        </h1>

        {prescriptions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-md text-center">
            <FaFileMedical className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No prescriptions found</p>
            <p className="text-gray-400 text-sm mt-2">Prescriptions will appear here after your consultations</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {prescriptions.map(presc => (
              <div key={presc._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Dr. {presc.doctor?.name}</h3>
                      <p className="text-sm text-green-700 font-medium">{presc.doctor?.specialization}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(presc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <span className="text-3xl">℞</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">Diagnosis</p>
                    <p className="text-gray-800 font-medium">{presc.diagnosis}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">Medicines ({presc.medicines.length})</p>
                    <div className="space-y-1">
                      {presc.medicines.slice(0, 2).map((med, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</span>
                          <span className="font-medium text-gray-800">{med.name}</span>
                          <span className="text-gray-500">· {med.dosage} · {med.duration}</span>
                        </div>
                      ))}
                      {presc.medicines.length > 2 && (
                        <p className="text-xs text-gray-400 ml-7">+{presc.medicines.length - 2} more medicines</p>
                      )}
                    </div>
                  </div>

                  {presc.followUpDate && (
                    <div className="bg-purple-50 text-purple-700 text-xs px-3 py-2 rounded-lg mb-4 font-medium">
                      📅 Follow-up: {new Date(presc.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedPrescription(presc)}
                      className="flex-1 border border-primary text-primary py-2 rounded-lg hover:bg-green-50 text-sm font-semibold transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handlePrintPDF(presc)}
                      className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-green-600 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <FaDownload /> Download PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Prescription Details</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePrintPDF(selectedPrescription)}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-semibold"
                >
                  <FaPrint /> Print / Download PDF
                </button>
                <button onClick={() => setSelectedPrescription(null)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-green-50 rounded-xl p-4 mb-5">
                <h3 className="font-bold text-lg text-gray-800">Dr. {selectedPrescription.doctor?.name}</h3>
                <p className="text-green-700">{selectedPrescription.doctor?.specialization} · {selectedPrescription.doctor?.qualification}</p>
                <p className="text-sm text-gray-500 mt-1">{selectedPrescription.doctor?.hospital}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Patient</p>
                  <p className="font-semibold text-gray-800 mt-1">{selectedPrescription.patient?.name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Date</p>
                  <p className="font-semibold text-gray-800 mt-1">{new Date(selectedPrescription.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">Diagnosis</p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 px-4 py-3 rounded-r-lg">
                  <p className="text-gray-800 font-medium">{selectedPrescription.diagnosis}</p>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-3">Medicines</p>
                <div className="space-y-3">
                  {selectedPrescription.medicines.map((med, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        <span className="font-bold text-gray-800">{med.name}</span>
                        <span className="text-sm text-primary font-semibold">{med.dosage}</span>
                      </div>
                      <div className="ml-8 text-sm text-gray-600 space-y-1">
                        <p>⏱ Duration: <span className="font-medium">{med.duration}</span></p>
                        <p>📋 {med.instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPrescription.advice && (
                <div className="mb-5">
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">Doctor's Advice</p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 px-4 py-3 rounded-r-lg">
                    <p className="text-gray-700">{selectedPrescription.advice}</p>
                  </div>
                </div>
              )}

              {selectedPrescription.followUpDate && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <p className="text-purple-700 font-semibold">
                    📅 Follow-up Appointment: {new Date(selectedPrescription.followUpDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
