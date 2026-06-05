import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { FaExclamationCircle, FaPlus, FaTimes, FaStethoscope, FaBell, FaSignOutAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { notificationAPI } from '../services/api';

const STATUS_STYLES = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

const PatientComplaints = () => {
  const { logout } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ subject: '', description: '', category: 'other' });

  useEffect(() => {
    fetchData();
    notificationAPI.getAll().then(r => setNotifications(r.data.data || [])).catch(() => {});
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getMyComplaints();
      setComplaints(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminAPI.createComplaint(form);
      showToast('Complaint submitted successfully');
      setShowForm(false);
      setForm({ subject: '', description: '', category: 'other' });
      fetchData();
    } catch { showToast('Failed to submit complaint', 'error'); }
    finally { setSubmitting(false); }
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaStethoscope className="text-emerald-600 text-xl" />
            <span className="text-lg font-bold text-gray-800">RuralCare</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/patient/dashboard', label: 'Dashboard' },
              { to: '/patient/appointments', label: 'Appointments' },
              { to: '/patient/prescriptions', label: 'Prescriptions' },
              { to: '/patient/support', label: 'Support' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className="px-3 py-2 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">{label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/patient/notifications" className="relative text-gray-500 hover:text-emerald-600 p-2">
              <FaBell />
              {unread > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unread}</span>}
            </Link>
            <button onClick={logout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </nav>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium
          ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Support & Complaints</h1>
            <p className="text-sm text-gray-500 mt-1">Report issues and track your support requests</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <FaPlus /> New Complaint
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <FaExclamationCircle className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No complaints submitted yet</p>
            <button onClick={() => setShowForm(true)} className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-emerald-700">
              Submit a Complaint
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map(c => (
              <div key={c._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{c.subject}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[c.status]}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{c.category}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {c.adminResponse && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs font-semibold text-green-700 mb-1">Admin Response</p>
                    <p className="text-sm text-green-800">{c.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Complaint Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Submit Complaint</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                  <option value="appointment">Appointment Issue</option>
                  <option value="doctor">Doctor Complaint</option>
                  <option value="technical">Technical Problem</option>
                  <option value="billing">Billing Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="Brief description of the issue"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe your issue in detail..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientComplaints;
