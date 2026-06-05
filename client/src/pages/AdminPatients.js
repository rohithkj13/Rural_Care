import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import {
  FaUsers, FaSearch, FaEdit, FaBan, FaCheckCircle, FaChevronDown,
  FaChevronUp, FaCalendarAlt, FaFileMedical, FaTimes, FaSave,
  FaExclamationTriangle, FaPhone, FaEnvelope, FaMapMarkerAlt
} from 'react-icons/fa';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [history, setHistory] = useState({});
  const [historyLoading, setHistoryLoading] = useState(null);
  const [editPatient, setEditPatient] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPatients({ search });
      setPatients(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!history[id]) {
      setHistoryLoading(id);
      try {
        const res = await adminAPI.getPatientHistory(id);
        setHistory(h => ({ ...h, [id]: res.data.data }));
      } catch (err) { console.error(err); }
      finally { setHistoryLoading(null); }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await adminAPI.togglePatientStatus(id);
      setPatients(p => p.map(x => x._id === id ? { ...x, isDisabled: res.data.data.isDisabled } : x));
      showToast(res.data.data.isDisabled ? 'Account disabled' : 'Account enabled');
    } catch { showToast('Failed to update status', 'error'); }
  };

  const openEdit = (p) => {
    setEditPatient(p);
    setEditForm({ name: p.name, phone: p.phone, age: p.age || '', gender: p.gender || '', address: p.address || '' });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminAPI.updatePatient(editPatient._id, editForm);
      showToast('Patient updated');
      setEditPatient(null);
      fetchPatients();
    } catch { showToast('Failed to update', 'error'); }
    finally { setSubmitting(false); }
  };

  const STATUS_STYLES = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-gray-100 text-gray-600',
  };

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium
          ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Patient Management</h1>
          <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">{patients.length} patients</span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input type="text" placeholder="Search by name, phone, or email..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700">Search</button>
        </form>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <FaUsers className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No patients found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map(p => (
              <div key={p._id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${p.isDisabled ? 'border-red-200 opacity-75' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => toggleExpand(p._id)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                      ${p.isDisabled ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>
                      {p.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 text-sm">{p.name}</h3>
                        {p.isDisabled && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Disabled</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500"><FaEnvelope className="text-gray-300" /> {p.email}</span>
                        {p.phone && <span className="flex items-center gap-1 text-xs text-gray-500"><FaPhone className="text-gray-300" /> {p.phone}</span>}
                        {p.age && <span className="text-xs text-gray-500">Age {p.age}</span>}
                        {p.gender && <span className="text-xs text-gray-500 capitalize">{p.gender}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); openEdit(p); }}
                      className="text-xs bg-blue-100 hover:bg-blue-500 text-blue-700 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleToggleStatus(p._id); }}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1
                        ${p.isDisabled ? 'bg-green-100 hover:bg-green-500 text-green-700 hover:text-white' : 'bg-red-100 hover:bg-red-500 text-red-600 hover:text-white'}`}>
                      {p.isDisabled ? <><FaCheckCircle /> Enable</> : <><FaBan /> Disable</>}
                    </button>
                    {expanded === p._id ? <FaChevronUp className="text-gray-400 ml-1" /> : <FaChevronDown className="text-gray-400 ml-1" />}
                  </div>
                </div>

                {expanded === p._id && (
                  <div className="border-t border-gray-100 px-5 pb-5">
                    {p.address && (
                      <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-red-400" /> {p.address}
                      </p>
                    )}
                    {p.medicalHistory && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs font-semibold text-amber-700 mb-1">Medical History</p>
                        <p className="text-sm text-amber-800">{p.medicalHistory}</p>
                      </div>
                    )}

                    {historyLoading === p._id ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : history[p._id] ? (
                      <div className="mt-4 grid sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
                            <FaCalendarAlt className="text-indigo-400" /> Appointments ({history[p._id].appointments.length})
                          </h4>
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {history[p._id].appointments.length === 0 ? (
                              <p className="text-xs text-gray-400">No appointments</p>
                            ) : history[p._id].appointments.map(a => (
                              <div key={a._id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                                <span className="text-gray-700">Dr. {a.doctor?.name} · {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                <span className={`px-2 py-0.5 rounded-full ${STATUS_STYLES[a.status] || 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
                            <FaFileMedical className="text-orange-400" /> Prescriptions ({history[p._id].prescriptions.length})
                          </h4>
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {history[p._id].prescriptions.length === 0 ? (
                              <p className="text-xs text-gray-400">No prescriptions</p>
                            ) : history[p._id].prescriptions.map(pr => (
                              <div key={pr._id} className="p-2 bg-gray-50 rounded text-xs">
                                <p className="text-gray-700 font-medium">{pr.diagnosis}</p>
                                <p className="text-gray-400">Dr. {pr.doctor?.name} · {new Date(pr.createdAt).toLocaleDateString()}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Patient Modal */}
      {editPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Edit {editPatient.name}</h2>
              <button onClick={() => setEditPatient(null)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'name', label: 'Name', type: 'text' },
                  { key: 'phone', label: 'Phone', type: 'tel' },
                  { key: 'age', label: 'Age', type: 'number' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                    <input type={type} value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                  <select value={editForm.gender || ''} onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" value={editForm.address || ''} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditPatient(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm disabled:opacity-50">
                  <FaSave /> {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPatients;
