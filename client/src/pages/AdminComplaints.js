import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { FaExclamationCircle, FaSearch, FaTimes, FaSave, FaReply } from 'react-icons/fa';

const STATUS_STYLES = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

const CATEGORY_STYLES = {
  appointment: 'bg-blue-100 text-blue-700',
  doctor: 'bg-purple-100 text-purple-700',
  technical: 'bg-orange-100 text-orange-700',
  billing: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-600',
};

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [respondTo, setRespondTo] = useState(null);
  const [responseForm, setResponseForm] = useState({ adminResponse: '', status: 'resolved' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchData(); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getComplaints({ status: statusFilter });
      setComplaints(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!responseForm.adminResponse.trim()) { showToast('Please write a response', 'error'); return; }
    setSubmitting(true);
    try {
      await adminAPI.respondToComplaint(respondTo._id, responseForm);
      showToast('Response sent successfully');
      setRespondTo(null);
      setResponseForm({ adminResponse: '', status: 'resolved' });
      fetchData();
    } catch { showToast('Failed to send response', 'error'); }
    finally { setSubmitting(false); }
  };

  const filtered = complaints.filter(c =>
    c.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    all: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  return (
    <AdminLayout badge={{ '/admin/complaints': counts.open }}>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium
          ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Complaint Management</h1>
          {counts.open > 0 && (
            <span className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full font-medium">
              {counts.open} open
            </span>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: `All (${complaints.length})` },
            { key: 'open', label: `Open${counts.open > 0 ? ` (${counts.open})` : ''}` },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'resolved', label: 'Resolved' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${statusFilter === key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" placeholder="Search by patient name or subject..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <FaExclamationCircle className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No complaints found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <div key={c._id} className={`bg-white rounded-xl border shadow-sm p-5 ${c.status === 'open' ? 'border-red-200' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold flex-shrink-0">
                      {c.patient?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-800 text-sm">{c.patient?.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[c.status]}`}>{c.status.replace('_', ' ')}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_STYLES[c.category]}`}>{c.category}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{c.patient?.email} · {c.patient?.phone}</p>
                      <p className="font-medium text-gray-800 mt-2 text-sm">{c.subject}</p>
                      <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted: {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {c.status !== 'resolved' && c.status !== 'closed' && (
                    <button
                      onClick={() => { setRespondTo(c); setResponseForm({ adminResponse: c.adminResponse || '', status: 'resolved' }); }}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors flex-shrink-0"
                    >
                      <FaReply /> Respond
                    </button>
                  )}
                </div>

                {c.adminResponse && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs font-semibold text-green-700 mb-1">Admin Response</p>
                    <p className="text-sm text-green-800">{c.adminResponse}</p>
                    {c.respondedAt && (
                      <p className="text-xs text-green-500 mt-1">
                        {new Date(c.respondedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Respond Modal */}
      {respondTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Respond to Complaint</h2>
              <button onClick={() => setRespondTo(null)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <div className="p-6">
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <p className="text-xs text-gray-500 font-medium">From: {respondTo.patient?.name}</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{respondTo.subject}</p>
                <p className="text-sm text-gray-600 mt-1">{respondTo.description}</p>
              </div>
              <form onSubmit={handleRespond} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Response <span className="text-red-500">*</span></label>
                  <textarea
                    value={responseForm.adminResponse}
                    onChange={e => setResponseForm(f => ({ ...f, adminResponse: e.target.value }))}
                    placeholder="Write your response to the patient..."
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                  <select value={responseForm.status} onChange={e => setResponseForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setRespondTo(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm disabled:opacity-50">
                    <FaSave /> {submitting ? 'Sending...' : 'Send Response'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminComplaints;
