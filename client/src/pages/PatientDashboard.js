import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { appointmentAPI, notificationAPI, doctorAPI } from '../services/api';
import {
  FaCalendarAlt, FaFileMedical, FaVideo, FaBell, FaUserMd,
  FaRobot, FaPills, FaVolumeUp, FaSearch, FaArrowRight,
  FaStethoscope, FaSignOutAlt, FaBars, FaTimes, FaUser,
  FaChevronRight, FaCheckCircle, FaClock, FaExclamationCircle,
  FaMapMarkerAlt, FaStar, FaPhone, FaComments, FaNotesMedical,
  FaFlask, FaNewspaper, FaRunning, FaTint
} from 'react-icons/fa';

const STATUS_CONFIG = {
  accepted:  { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',  dot: 'bg-emerald-500',  label: 'Confirmed' },
  pending:   { cls: 'bg-amber-50 text-amber-700 border-amber-200',        dot: 'bg-amber-500',    label: 'Pending' },
  rejected:  { cls: 'bg-red-50 text-red-700 border-red-200',              dot: 'bg-red-500',      label: 'Rejected' },
  completed: { cls: 'bg-blue-50 text-blue-700 border-blue-200',           dot: 'bg-blue-500',     label: 'Completed' },
  cancelled: { cls: 'bg-gray-50 text-gray-600 border-gray-200',           dot: 'bg-gray-400',     label: 'Cancelled' },
};

const TYPE_ICON = { video: FaVideo, audio: FaPhone, chat: FaComments };

const navLinks = [
  { to: '/patient/dashboard', label: 'Home' },
  { to: '/patient/doctors', label: 'Doctors' },
  { to: '/patient/appointments', label: 'Appointments' },
  { to: '/patient/prescriptions', label: 'Prescriptions' },
  { to: '/patient/reports', label: 'Reports' },
  { to: '/patient/support', label: 'Support' },
];

const PatientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptRes, notifRes, docRes] = await Promise.all([
        appointmentAPI.getPatientAppointments(),
        notificationAPI.getAll(),
        doctorAPI.getAll()
      ]);
      setAppointments(apptRes.data.data || []);
      setNotifications(notifRes.data.data || []);
      setDoctors((docRes.data.data || []).slice(0, 4));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const unread = notifications.filter(n => !n.isRead).length;
  const upcoming = appointments.filter(a => ['accepted', 'pending'].includes(a.status));
  const nextAppt = upcoming[0];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/patient/doctors?search=${search}`);
  };

  const goTo = (path) => {
    try {
      navigate(path);
    } catch {
      window.location.href = path;
    }
  };

  const quickActions = [
    { to: '/patient/book-appointment', icon: FaCalendarAlt, label: 'Book Appointment', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { to: '/patient/doctors', icon: FaUserMd, label: 'Find Doctors', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { to: '/patient/lab-tests', icon: FaFlask, label: 'Lab Tests', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
    { to: '/patient/health-feed', icon: FaNewspaper, label: 'Health Feed', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
    { to: '/patient/symptom-checker', icon: FaRobot, label: 'Symptom Checker', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { to: '/patient/prescriptions', icon: FaFileMedical, label: 'Prescriptions', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { to: '/patient/reports', icon: FaNotesMedical, label: 'Medical Reports', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
    { to: '/patient/reminders', icon: FaPills, label: 'Reminders', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    { to: '/patient/fitness', icon: FaRunning, label: 'Fitness Tracker', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { to: '/patient/blood-donors', icon: FaTint, label: 'Blood Donors', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  ];

  const avatarColors = ['from-blue-500 to-blue-700', 'from-emerald-500 to-emerald-700', 'from-purple-500 to-purple-700', 'from-rose-500 to-rose-700'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/patient/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <FaStethoscope className="text-white text-sm" />
              </div>
              <span className="font-bold text-gray-900 text-lg">RuralCare</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className="px-3 py-2 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-medium">
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Link to="/patient/notifications" className="relative p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                <FaBell className="text-lg" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
              <Link to="/patient/profile" className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-24 truncate">{user?.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={logout} className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
                <FaSignOutAlt /> Logout
              </button>
              <button onClick={() => setMobileMenu(m => !m)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                {mobileMenu ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMobileMenu(false)}
                className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium">
                {label}
              </Link>
            ))}
            <button onClick={logout} className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg font-medium">
              Logout
            </button>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Hero Search Banner ── */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <p className="text-emerald-100 text-sm font-medium mb-1">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-5">
              How are you feeling today?
            </h1>
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search doctors, specializations..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-sm"
                />
              </div>
              <button type="submit" className="bg-white text-emerald-700 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors shadow-sm flex-shrink-0">
                Search
              </button>
            </form>
          </div>
        </div>

        {/* ── Next Appointment Banner ── */}
        {nextAppt && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <FaCalendarAlt className="text-emerald-600 text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Upcoming Appointment</p>
                <p className="font-semibold text-gray-900 mt-0.5">Dr. {nextAppt.doctor?.name}</p>
                <p className="text-sm text-gray-500">{nextAppt.doctor?.specialization} · {new Date(nextAppt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {nextAppt.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {(() => { const cfg = STATUS_CONFIG[nextAppt.status] || STATUS_CONFIG.pending; return (
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${cfg.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {cfg.label}
                </span>
              ); })()}
              {nextAppt.status === 'accepted' && (
                <Link to={`/consultation/${nextAppt._id}`}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-xl font-semibold transition-colors">
                  <FaVideo className="text-xs" /> Join Now
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Quick Actions ── */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pointer-events-auto">
            {quickActions.map(({ to, icon: Icon, label, color, bg, border }) => (
              <button
                key={to}
                type="button"
                onClick={() => goTo(to)}
                className={`relative z-10 cursor-pointer pointer-events-auto flex flex-col items-center gap-2.5 p-4 rounded-2xl border ${border} ${bg} hover:shadow-md transition-all group`}
              >
                <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`text-lg ${color}`} />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Recent Appointments ── */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900">Recent Appointments</h2>
              <Link to="/patient/appointments" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                View all <FaChevronRight className="text-xs" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FaCalendarAlt className="text-gray-300 text-2xl" />
                </div>
                <p className="text-gray-500 text-sm mb-4">No appointments yet</p>
                <Link to="/patient/book-appointment"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                  Book your first appointment
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {appointments.slice(0, 5).map(apt => {
                  const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                  const TypeIcon = TYPE_ICON[apt.consultationType] || FaVideo;
                  return (
                    <div key={apt._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                            {apt.doctor?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">Dr. {apt.doctor?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{apt.doctor?.specialization}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-400">
                                {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {apt.time}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <TypeIcon className="text-xs" /> {apt.consultationType}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                            {cfg.label}
                          </span>
                          {apt.status === 'accepted' && (
                            <Link to={`/consultation/${apt._id}`}
                              className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                              Join
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-4">
            {/* Health Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Health Summary</h2>
              <div className="space-y-3">
                {[
                  { label: 'Total Appointments', value: appointments.length, icon: FaCalendarAlt, color: 'text-blue-500 bg-blue-50' },
                  { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, icon: FaCheckCircle, color: 'text-emerald-500 bg-emerald-50' },
                  { label: 'Upcoming', value: upcoming.length, icon: FaClock, color: 'text-amber-500 bg-amber-50' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                        <Icon className="text-sm" />
                      </div>
                      <span className="text-sm text-gray-600">{label}</span>
                    </div>
                    <span className="font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <FaBell className="text-amber-500 text-sm" /> Notifications
                  {unread > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unread}</span>}
                </h2>
                <Link to="/patient/notifications" className="text-xs text-emerald-600 hover:underline">View all</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <p className="px-5 py-6 text-center text-gray-400 text-sm">No notifications</p>
                ) : (
                  notifications.slice(0, 4).map(n => (
                    <div key={n._id} className={`px-5 py-3 ${!n.isRead ? 'bg-emerald-50' : ''}`}>
                      <div className="flex items-start gap-2">
                        {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />}
                        <div className={!n.isRead ? '' : 'pl-3.5'}>
                          <p className="text-sm font-medium text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Featured Doctors ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">Available Doctors</h2>
            <Link to="/patient/doctors" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              View all <FaChevronRight className="text-xs" />
            </Link>
          </div>
          {doctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-gray-400 text-sm">No doctors available</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {doctors.map((doc, i) => (
                <div key={doc._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  <div className={`bg-gradient-to-br ${avatarColors[i % avatarColors.length]} p-5 text-center`}>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                      <span className="text-xl font-bold text-gray-700">{doc.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <p className="text-white font-bold text-sm">Dr. {doc.name}</p>
                    <p className="text-white text-opacity-80 text-xs mt-0.5">{doc.specialization}</p>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(s => (
                          <FaStar key={s} className={`text-xs ${s <= Math.round(doc.rating || 4) ? 'text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{doc.experience || 0} yrs</span>
                    </div>
                    <p className="text-emerald-600 font-bold text-sm mb-3">₹{doc.consultationFee || 0} <span className="text-gray-400 font-normal text-xs">/ consult</span></p>
                    <Link to={`/patient/book-appointment/${doc._id}`}
                      className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 rounded-xl font-semibold transition-colors">
                      Book Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Specializations ── */}
        <div>
          <h2 className="font-bold text-gray-900 text-lg mb-4">Consult by Specialization</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { name: 'Cardiologist', emoji: '❤️' },
              { name: 'Dermatologist', emoji: '🧴' },
              { name: 'Pediatrician', emoji: '👶' },
              { name: 'General Physician', emoji: '🩺' },
              { name: 'Orthopedic', emoji: '🦴' },
              { name: 'Neurologist', emoji: '🧠' },
              { name: 'Gynecologist', emoji: '👩‍⚕️' },
              { name: 'Psychiatrist', emoji: '🧘' },
            ].map(({ name, emoji }) => (
              <Link key={name} to={`/patient/doctors?search=${name}`}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all text-center group">
                <span className="text-2xl group-hover:scale-110 transition-transform">{emoji}</span>
                <span className="text-xs font-medium text-gray-700 leading-tight">{name}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-8 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center">
              <FaStethoscope className="text-white text-xs" />
            </div>
            <span className="text-sm font-semibold text-gray-700">RuralCare Connect</span>
          </div>
          <p className="text-xs text-gray-400">© 2024 RuralCare Connect · Making healthcare accessible for all</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="cursor-pointer hover:text-gray-600">Privacy</span>
            <span className="cursor-pointer hover:text-gray-600">Terms</span>
            <Link to="/patient/support" className="cursor-pointer hover:text-gray-600">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientDashboard;
