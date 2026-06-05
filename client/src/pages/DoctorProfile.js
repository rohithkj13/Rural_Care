import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authAPI, notificationAPI } from '../services/api';
import DoctorLayout from '../components/DoctorLayout';
import {
  FaUserMd, FaEdit, FaSave, FaTimes, FaPhone, FaEnvelope,
  FaHospital, FaGraduationCap, FaBriefcase, FaRupeeSign, FaStar
} from 'react-icons/fa';

const Field = ({ icon: Icon, label, value, color = 'text-emerald-500' }) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
    <Icon className={`${color} text-lg mt-0.5 flex-shrink-0`} />
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

const DoctorProfile = () => {
  const { user, login, token } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({
    name: '', phone: '', specialization: '', qualification: '',
    experience: '', hospital: '', consultationFee: ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        specialization: user.specialization || '',
        qualification: user.qualification || '',
        experience: user.experience || '',
        hospital: user.hospital || '',
        consultationFee: user.consultationFee || ''
      });
    }
    notificationAPI.getAll().then(r => setNotifications(r.data.data || [])).catch(() => {});
  }, [user]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(form);
      login(token, res.data.data);
      showToast('Profile updated successfully');
      setEditing(false);
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <DoctorLayout notifications={unread}>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium
          ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-5">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-3xl font-bold border-2 border-white border-opacity-40">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dr. {user?.name}</h1>
              <p className="text-emerald-100">{user?.specialization || 'General Physician'}</p>
              <p className="text-emerald-200 text-sm mt-1">{user?.hospital || 'Hospital not set'}</p>
              {user?.rating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <FaStar className="text-yellow-300 text-sm" />
                  <span className="text-sm">{user.rating.toFixed(1)} ({user.totalRatings} ratings)</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="ml-auto flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {editing ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit Profile</>}
            </button>
          </div>
        </div>

        {editing ? (
          /* Edit Form */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-5">Edit Profile</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={form.specialization}
                    onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
                    placeholder="e.g. Cardiologist"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={form.qualification}
                    onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))}
                    placeholder="e.g. MBBS, MD"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                  <input
                    type="number"
                    value={form.experience}
                    onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                    min="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Clinic</label>
                  <input
                    type="text"
                    value={form.hospital}
                    onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={form.consultationFee}
                    onChange={e => setForm(f => ({ ...f, consultationFee: e.target.value }))}
                    min="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* View Mode */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-5">Professional Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field icon={FaEnvelope} label="Email" value={user?.email} color="text-blue-500" />
              <Field icon={FaPhone} label="Phone" value={user?.phone} color="text-green-500" />
              <Field icon={FaUserMd} label="Specialization" value={user?.specialization} color="text-emerald-500" />
              <Field icon={FaGraduationCap} label="Qualification" value={user?.qualification} color="text-purple-500" />
              <Field icon={FaBriefcase} label="Experience" value={user?.experience ? `${user.experience} years` : null} color="text-orange-500" />
              <Field icon={FaHospital} label="Hospital / Clinic" value={user?.hospital} color="text-red-500" />
              <Field icon={FaRupeeSign} label="Consultation Fee" value={user?.consultationFee ? `₹${user.consultationFee}` : null} color="text-teal-500" />
              <Field icon={FaStar} label="Rating" value={user?.rating > 0 ? `${user.rating.toFixed(1)} / 5 (${user.totalRatings} reviews)` : 'No ratings yet'} color="text-yellow-500" />
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Account Type</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{user?.role}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Member Since</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Status</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${user?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorProfile;
