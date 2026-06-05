import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI, notificationAPI } from '../services/api';
import {
  FaUser, FaEdit, FaSave, FaTimes, FaPhone, FaEnvelope,
  FaMapMarkerAlt, FaVenusMars, FaBirthdayCake, FaNotesMedical,
  FaBell, FaCalendarAlt, FaFileMedical, FaUserMd, FaRobot,
  FaPills, FaVolumeUp, FaSignOutAlt, FaStethoscope
} from 'react-icons/fa';

const PatientProfile = () => {
  const { user, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const goTo = (path) => {
    try {
      navigate(path);
    } catch {
      window.location.href = path;
    }
  };

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({
    name: '', phone: '', age: '', gender: '', address: '', medicalHistory: ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        age: user.age || '',
        gender: user.gender || '',
        address: user.address || '',
        medicalHistory: user.medicalHistory || ''
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
      const updatedUser = res.data.data;
      login(localStorage.getItem('token'), updatedUser);
      // Sync form with what was actually saved
      setForm({
        name: updatedUser.name || '',
        phone: updatedUser.phone || '',
        age: updatedUser.age || '',
        gender: updatedUser.gender || '',
        address: updatedUser.address || '',
        medicalHistory: updatedUser.medicalHistory || ''
      });
      showToast('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaStethoscope className="text-emerald-600 text-xl" />
            <span className="text-lg font-bold text-gray-800">RuralCare</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/patient/dashboard', label: 'Dashboard' },
              { to: '/patient/doctors', label: 'Doctors' },
              { to: '/patient/appointments', label: 'Appointments' },
              { to: '/patient/prescriptions', label: 'Prescriptions' },
              { to: '/patient/reports', label: 'Reports' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className="px-3 py-2 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/patient/notifications" className="relative text-gray-500 hover:text-emerald-600 p-2">
              <FaBell />
              {unread > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unread}
                </span>
              )}
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
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-3xl font-bold border-2 border-white border-opacity-40">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-blue-100 text-sm mt-0.5">{user?.email}</p>
              <p className="text-blue-200 text-sm">{user?.phone}</p>
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-5">Edit Profile</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    min="0" max="120"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Village, District, State"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                  <textarea value={form.medicalHistory} onChange={e => setForm(f => ({ ...f, medicalHistory: e.target.value }))}
                    placeholder="Any existing conditions, allergies, past surgeries..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditing(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-5">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: FaEnvelope, label: 'Email', value: user?.email, color: 'text-blue-500' },
                { icon: FaPhone, label: 'Phone', value: user?.phone, color: 'text-green-500' },
                { icon: FaBirthdayCake, label: 'Age', value: user?.age ? `${user.age} years` : null, color: 'text-orange-500' },
                { icon: FaVenusMars, label: 'Gender', value: user?.gender, color: 'text-purple-500' },
                { icon: FaMapMarkerAlt, label: 'Address', value: user?.address, color: 'text-red-500' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Icon className={`${color} text-lg mt-0.5 flex-shrink-0`} />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{value || '—'}</p>
                  </div>
                </div>
              ))}
              {user?.medicalHistory && (
                <div className="sm:col-span-2 flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <FaNotesMedical className="text-amber-500 text-lg mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Medical History</p>
                    <p className="text-sm text-amber-800 mt-0.5">{user.medicalHistory}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { to: '/patient/book-appointment', icon: FaCalendarAlt, label: 'Book Appointment', color: 'text-blue-500 bg-blue-50' },
              { to: '/patient/doctors', icon: FaUserMd, label: 'Find Doctors', color: 'text-emerald-500 bg-emerald-50' },
              { to: '/patient/prescriptions', icon: FaFileMedical, label: 'Prescriptions', color: 'text-orange-500 bg-orange-50' },
              { to: '/patient/reports', icon: FaNotesMedical, label: 'Medical Reports', color: 'text-purple-500 bg-purple-50' },
              { to: '/patient/reminders', icon: FaPills, label: 'Reminders', color: 'text-red-500 bg-red-50' },
              { to: '/patient/symptom-checker', icon: FaRobot, label: 'Symptom Checker', color: 'text-indigo-500 bg-indigo-50' },
            ].map(({ to, icon: Icon, label, color }) => (
              <button key={to} type="button" onClick={() => goTo(to)} className="cursor-pointer pointer-events-auto relative z-10 flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="text-lg" />
                </div>
                <span className="text-xs font-medium text-gray-700">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
