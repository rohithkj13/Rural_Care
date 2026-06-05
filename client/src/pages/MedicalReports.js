import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI } from '../services/api';
import {
  FaFileMedical, FaUpload, FaTrash, FaEye, FaRobot,
  FaUserMd, FaTimes, FaStethoscope, FaChevronDown, FaChevronUp
} from 'react-icons/fa';

const MedicalReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [formData, setFormData] = useState({ reportType: '', reportName: '', description: '', file: null });
  const [toast, setToast] = useState('');

  useEffect(() => { fetchReports(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getAll();
      setReports(res.data.data || []);
    } catch { }
    finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', formData.file);
      data.append('reportType', formData.reportType);
      data.append('reportName', formData.reportName);
      data.append('description', formData.description);
      const res = await reportAPI.upload(data);
      setShowUpload(false);
      setFormData({ reportType: '', reportName: '', description: '', file: null });
      await fetchReports();
      // Auto-expand the newly uploaded report to show AI summary
      setExpanded(res.data.data._id);
      showToast('Report uploaded! AI summary generated.');
    } catch {
      showToast('Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await reportAPI.delete(id);
      fetchReports();
      showToast('Report deleted');
    } catch { showToast('Failed to delete'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-sm px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/patient/dashboard" className="flex items-center gap-2">
            <FaStethoscope className="text-emerald-600" />
            <span className="font-bold text-gray-900">RuralCare Connect</span>
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm text-gray-600">
            <Link to="/patient/dashboard" className="hover:text-emerald-600">Dashboard</Link>
            <Link to="/patient/doctors" className="hover:text-emerald-600">Doctors</Link>
            <Link to="/patient/appointments" className="hover:text-emerald-600">Appointments</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical Reports</h1>
            <p className="text-sm text-gray-500 mt-0.5">Upload reports to get AI overview and doctor feedback</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <FaUpload className="text-xs" /> Upload Report
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <FaFileMedical className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No reports uploaded yet</p>
            <p className="text-gray-400 text-sm mt-1">Upload your first medical report to get an AI overview</p>
            <button onClick={() => setShowUpload(true)}
              className="mt-4 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700">
              Upload Report
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <div key={report._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Report Header */}
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <FaFileMedical className="text-emerald-600 text-xl" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{report.reportName}</h3>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{report.reportType}</span>
                        <span className="text-xs text-gray-400">{new Date(report.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {report.aiSummary && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><FaRobot className="text-xs" /> AI Summary</span>}
                        {report.doctorNote && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><FaUserMd className="text-xs" /> Doctor Note</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={`http://localhost:5000${report.fileUrl}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors">
                      <FaEye /> View
                    </a>
                    <button onClick={() => handleDelete(report._id)}
                      className="flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg transition-colors">
                      <FaTrash />
                    </button>
                    <button onClick={() => setExpanded(expanded === report._id ? null : report._id)}
                      className="flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg transition-colors font-medium">
                      {expanded === report._id ? <><FaChevronUp /> Hide</> : <><FaChevronDown /> Details</>}
                    </button>
                  </div>
                </div>

                {/* Expanded: AI Summary + Doctor Note */}
                {expanded === report._id && (
                  <div className="border-t border-gray-100 p-5 space-y-4">
                    {report.description && (
                      <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                        <p className="font-semibold text-gray-700 mb-1">Description</p>
                        <p>{report.description}</p>
                      </div>
                    )}

                    {/* AI Summary */}
                    {report.aiSummary && (
                      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FaRobot className="text-purple-600" />
                          <p className="font-semibold text-purple-800 text-sm">AI Overview</p>
                          <span className="text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">Auto-generated</span>
                        </div>
                        <div className="text-sm text-purple-900 leading-relaxed whitespace-pre-line">{report.aiSummary}</div>
                        <p className="text-xs text-purple-400 mt-2">⚠ This is an informational overview only. Always consult your doctor for medical advice.</p>
                      </div>
                    )}

                    {/* Doctor Note */}
                    {report.doctorNote ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FaUserMd className="text-emerald-600" />
                          <p className="font-semibold text-emerald-800 text-sm">Doctor's Assessment</p>
                          {report.doctorNoteBy && (
                            <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Dr. {report.doctorNoteBy.name} · {report.doctorNoteBy.specialization}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-emerald-900 leading-relaxed">{report.doctorNote}</p>
                        {report.doctorNoteAt && (
                          <p className="text-xs text-emerald-400 mt-2">
                            {new Date(report.doctorNoteAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center">
                        <FaUserMd className="text-gray-300 text-2xl mx-auto mb-1" />
                        <p className="text-sm text-gray-400">No doctor assessment yet. Share this report with your doctor during consultation.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Upload Medical Report</h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600 p-1"><FaTimes /></button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  value={formData.reportType} onChange={e => setFormData({ ...formData, reportType: e.target.value })} required>
                  <option value="">Select Type</option>
                  <option>Blood Test</option>
                  <option>X-Ray</option>
                  <option>CT Scan</option>
                  <option>MRI</option>
                  <option>Prescription</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Name *</label>
                <input type="text" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  value={formData.reportName} onChange={e => setFormData({ ...formData, reportName: e.target.value })} required
                  placeholder="e.g. CBC Report - Jan 2025" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Any notes about this report..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  onChange={e => setFormData({ ...formData, file: e.target.files[0] })} required />
                <p className="text-xs text-gray-400 mt-1">Supported: PDF, JPG, PNG, DOC (max 10MB)</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 flex items-start gap-2">
                <FaRobot className="text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-purple-700">An AI overview will be automatically generated after upload to help you understand your report.</p>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowUpload(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={uploading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors">
                  {uploading ? 'Uploading...' : 'Upload & Analyse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalReports;
