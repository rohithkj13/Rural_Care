import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import {
  FaUserMd, FaSearch, FaPlus, FaTrash, FaEdit,
  FaTimes, FaSave, FaGraduationCap, FaHospital,
  FaExclamationTriangle, FaCheckCircle
} from 'react-icons/fa';

const emptyForm = { name: '', email: '', password: '', phone: '', specialization: '', qualification: '', experience: '', hospital: '', consultationFee: '' };

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchDoctors(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'pending') params.approved = 'false';
      if (filter === 'approved') params.approved = 'true';
      const res = await adminAPI.getDoctors(params);
      setDoctors(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveDoctor(id);
      showToast('Doctor approved successfully');
      fetchDoctors();
    } catch { showToast('Failed to approve', 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteDoctor(id);
      showToast('Doctor deleted');
      setConfirmDelete(null);
      fetchDoctors();
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminAPI.addDoctor(form);
      showToast('Doctor added successfully');
      setShowAdd(false);
      setForm(emptyForm);
      fetchDoctors();
    } catch (err) { showToast(err.response?.data?.message || 'Failed to add doctor', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminAPI.updateDoctor(editDoc._id, editForm);
      showToast('Doctor updated');
      setEditDoc(null);
      fetchDoctors();
    } catch { showToast('Failed to update', 'error'); }
    finally { setSubmitting(false); }
  };

  const openEdit = (doc) => {
    setEditDoc(doc);
    setEditForm({ name: doc.name, phone: doc.phone, specialization: doc.specialization, qualification: doc.qualification, experience: doc.experience, hospital: doc.hospital, consultationFee: doc.consultationFee });
  };

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
    d.hospital?.toLowerCase().includes(search.toLowerCase())
  );

  const pending = doctors.filter(d => !d.isApproved).length;

  return (
    <AdminLayout badge={{ '/admin/doctors': pending }}>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium
          ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Doctor Management</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FaPlus /> Add Doctor
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: `All (${doctors.length})` },
            { key: 'approved', label: 'Approved' },
            { key: 'pending', label: `Pending Approval${pending > 0 ? ` (${pending})` : ''}` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${filter === key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" placeholder="Search by name, specialization, hospital..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <FaUserMd className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No doctors found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(doc => (
              <div key={doc._id} className={`bg-white rounded-xl border shadow-sm p-5 ${!doc.isApproved ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
                      {doc.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{doc.name}</h3>
                      <p className="text-xs text-gray-500">{doc.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${doc.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {doc.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                  <p className="flex items-center gap-2"><FaUserMd className="text-indigo-400 text-xs" /> {doc.specialization || '—'}</p>
                  <p className="flex items-center gap-2"><FaGraduationCap className="text-purple-400 text-xs" /> {doc.qualification || '—'}</p>
                  <p className="flex items-center gap-2"><FaHospital className="text-emerald-400 text-xs" /> {doc.hospital || '—'}</p>
                  {doc.experience && <p className="text-xs text-gray-400">{doc.experience} yrs experience · ₹{doc.consultationFee || 0} fee</p>}
                  <p className="text-xs text-gray-400">{doc.phone}</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {!doc.isApproved && (
                    <button onClick={() => handleApprove(doc._id)}
                      className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                      <FaCheckCircle /> Approve
                    </button>
                  )}
                  <button onClick={() => openEdit(doc)}
                    className="flex items-center gap-1 bg-blue-100 hover:bg-blue-500 text-blue-700 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => setConfirmDelete(doc)}
                    className="flex items-center gap-1 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      {showAdd && (
        <Modal title="Add New Doctor" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'name', label: 'Full Name', type: 'text', required: true },
                { key: 'email', label: 'Email', type: 'email', required: true },
                { key: 'password', label: 'Password', type: 'password', required: true },
                { key: 'phone', label: 'Phone', type: 'tel', required: true },
                { key: 'specialization', label: 'Specialization', type: 'text' },
                { key: 'qualification', label: 'Qualification', type: 'text' },
                { key: 'experience', label: 'Experience (yrs)', type: 'number' },
                { key: 'hospital', label: 'Hospital', type: 'text' },
                { key: 'consultationFee', label: 'Consultation Fee (₹)', type: 'number' },
              ].map(({ key, label, type, required }) => (
                <div key={key} className={key === 'hospital' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    required={required}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              ))}
            </div>
            <ModalActions onCancel={() => setShowAdd(false)} submitting={submitting} label="Add Doctor" />
          </form>
        </Modal>
      )}

      {/* Edit Doctor Modal */}
      {editDoc && (
        <Modal title={`Edit Dr. ${editDoc.name}`} onClose={() => setEditDoc(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'name', label: 'Full Name', type: 'text' },
                { key: 'phone', label: 'Phone', type: 'tel' },
                { key: 'specialization', label: 'Specialization', type: 'text' },
                { key: 'qualification', label: 'Qualification', type: 'text' },
                { key: 'experience', label: 'Experience (yrs)', type: 'number' },
                { key: 'consultationFee', label: 'Fee (₹)', type: 'number' },
                { key: 'hospital', label: 'Hospital', type: 'text', span: true },
              ].map(({ key, label, type, span }) => (
                <div key={key} className={span ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              ))}
            </div>
            <ModalActions onCancel={() => setEditDoc(null)} submitting={submitting} label="Save Changes" />
          </form>
        </Modal>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)}>
          <div className="text-center py-4">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-3" />
            <p className="text-gray-700 mb-1">Delete <strong>Dr. {confirmDelete.name}</strong>?</p>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone. All associated data will remain.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete._id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm">Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h2 className="text-base font-bold text-gray-800">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const ModalActions = ({ onCancel, submitting, label }) => (
  <div className="flex gap-3 pt-2">
    <button type="button" onClick={onCancel} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
    <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
      <FaSave /> {submitting ? 'Saving...' : label}
    </button>
  </div>
);

export default AdminDoctors;
