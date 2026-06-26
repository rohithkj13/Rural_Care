import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { appointmentAPI, doctorAPI, prescriptionAPI, notificationAPI, reviewAPI } from '../services/api';
import DoctorLayout from '../components/DoctorLayout';
import {
  FaUsers, FaCalendarAlt, FaStethoscope, FaFileMedical,
  FaCheck, FaTimes, FaClock, FaVideo, FaPhone, FaComments,
  FaArrowRight, FaUserMd, FaChartLine, FaStar
} from 'react-icons/fa';

const StatCard = ({ icon: Icon, value, label, color, bg }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border border-gray-100">
    <div className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`text-2xl ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const typeIcon = { video: FaVideo, audio: FaPhone, chat: FaComments };
const typeColor = { video: 'text-blue-500', audio: 'text-green-500', chat: 'text-purple-500' };

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptRes, statsRes, presRes, notifRes, reviewRes] = await Promise.all([
        appointmentAPI.getAll(),
        doctorAPI.getStats(),
        prescriptionAPI.getAll(),
        notificationAPI.getAll(),
        reviewAPI.getForDoctor(user?.id || '')
      ]);
      setAppointments(apptRes.data.data || []);
      setStats(statsRes.data.data || {});
      setPrescriptions(presRes.data.data || []);
      setNotifications(notifRes.data.data || []);
      setReviews(reviewRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    setActionLoading(id + status);
    try {
      await appointmentAPI.updateStatus(id, { status });
      showToast(`Appointment ${status} successfully`);
      fetchData();
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const pending = appointments.filter(a => a.status === 'pending');
  const today = appointments.filter(a => {
    const d = new Date(a.date);
    const now = new Date();
    return d.toDateString() === now.toDateString() && a.status === 'accepted';
  });
  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  const statCards = [
    { icon: FaUsers, value: stats.totalPatients || 0, label: 'Total Patients', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: FaStethoscope, value: stats.totalConsultations || 0, label: 'Consultations Done', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: FaCalendarAlt, value: stats.todayAppointments || 0, label: "Today's Appointments", color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: FaFileMedical, value: prescriptions.length, label: 'Prescriptions Issued', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <DoctorLayout notifications={unreadNotifs}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium
          ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, Dr. {user?.name}!</h1>
                <p className="text-emerald-100 mt-1">
                  {pending.length > 0
                    ? `You have ${pending.length} pending appointment${pending.length > 1 ? 's' : ''} awaiting your response.`
                    : 'All caught up! No pending appointments.'}
                </p>
              </div>
              <FaUserMd className="text-6xl text-emerald-300 hidden md:block" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((s, i) => <StatCard key={i} {...s} />)}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Pending Appointments */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <FaClock className="text-yellow-500" /> Pending Requests
                  {pending.length > 0 && (
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">{pending.length}</span>
                  )}
                </h2>
                <Link to="/doctor/appointments" className="text-emerald-600 text-sm hover:underline flex items-center gap-1">
                  View all <FaArrowRight className="text-xs" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {pending.length === 0 ? (
                  <div className="px-6 py-10 text-center text-gray-400">
                    <FaCalendarAlt className="text-4xl mx-auto mb-2 text-gray-200" />
                    <p>No pending appointments</p>
                  </div>
                ) : (
                  pending.slice(0, 5).map(apt => {
                    const TypeIcon = typeIcon[apt.consultationType] || FaVideo;
                    return (
                      <div key={apt._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold flex-shrink-0">
                              {apt.patient?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 truncate">{apt.patient?.name}</p>
                              <p className="text-xs text-gray-500">
                                {apt.patient?.age && `Age ${apt.patient.age}`}
                                {apt.patient?.gender && ` · ${apt.patient.gender}`}
                              </p>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span className="text-xs text-gray-500">
                                  {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {apt.time}
                                </span>
                                <span className={`flex items-center gap-1 text-xs ${typeColor[apt.consultationType]}`}>
                                  <TypeIcon /> {apt.consultationType}
                                </span>
                              </div>
                              {apt.symptoms && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  <span className="font-medium">Symptoms:</span> {apt.symptoms}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleStatus(apt._id, 'accepted')}
                              disabled={actionLoading === apt._id + 'accepted'}
                              className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <FaCheck /> Accept
                            </button>
                            <button
                              onClick={() => handleStatus(apt._id, 'rejected')}
                              disabled={actionLoading === apt._id + 'rejected'}
                              className="flex items-center gap-1 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <FaTimes /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Today's Schedule */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <FaCalendarAlt className="text-emerald-500" /> Today's Schedule
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {today.length === 0 ? (
                    <p className="px-5 py-6 text-center text-gray-400 text-sm">No consultations today</p>
                  ) : (
                    today.slice(0, 4).map(apt => (
                      <div key={apt._id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{apt.patient?.name}</p>
                          <p className="text-xs text-gray-500">{apt.time} · {apt.consultationType}</p>
                        </div>
                        <Link
                          to={`/consultation/${apt._id}`}
                          className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          Join
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FaChartLine className="text-blue-500" /> Quick Actions
                </h2>
                <div className="space-y-2">
                  <Link to="/doctor/appointments" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-sm text-gray-700">
                    <span>Manage Appointments</span><FaArrowRight className="text-xs" />
                  </Link>
                  <Link to="/doctor/patients" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-sm text-gray-700">
                    <span>View All Patients</span><FaArrowRight className="text-xs" />
                  </Link>
                  <Link to="/doctor/prescriptions" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-sm text-gray-700">
                    <span>Prescriptions</span><FaArrowRight className="text-xs" />
                  </Link>
                  <Link to="/doctor/profile" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-sm text-gray-700">
                    <span>Edit Profile</span><FaArrowRight className="text-xs" />
                  </Link>
                  <Link to="/doctor/fitness" className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors text-sm font-medium">
                    <span>🏃 Patient Fitness Monitor</span><FaArrowRight className="text-xs" />
                  </Link>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <FaStar className="text-yellow-400" /> Patient Reviews
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{reviews.length}</span>
                  </h2>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400 text-xs" />
                      <span className="text-sm font-bold text-gray-800">
                        {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">avg</span>
                    </div>
                  )}
                </div>
                {/* Rating bar chart */}
                {reviews.length > 0 && (
                  <div className="px-5 pt-3 pb-1">
                    {[5,4,3,2,1].map(star => {
                      const count = reviews.filter(r => r.rating === star).length;
                      const pct = Math.round((count / reviews.length) * 100);
                      return (
                        <div key={star} className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 w-3">{star}</span>
                          <FaStar className="text-yellow-400 text-xs" />
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-5">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="divide-y divide-gray-50 max-h-52 overflow-y-auto">
                  {reviews.length === 0 ? (
                    <p className="px-5 py-6 text-center text-gray-400 text-sm">No reviews yet</p>
                  ) : reviews.slice(0, 5).map(r => (
                    <div key={r._id} className="px-5 py-3">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-semibold text-gray-800">{r.patient?.name}</p>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => <FaStar key={s} className={`text-xs ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`} />)}
                        </div>
                      </div>
                      {r.comment && <p className="text-xs text-gray-500 line-clamp-2">{r.comment}</p>}
                      <p className="text-xs text-gray-300 mt-0.5">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <FaFileMedical className="text-orange-500" /> Recent Prescriptions
                  </h2>
                  <Link to="/doctor/prescriptions" className="text-emerald-600 text-xs hover:underline">View all</Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {prescriptions.length === 0 ? (
                    <p className="px-5 py-6 text-center text-gray-400 text-sm">No prescriptions yet</p>
                  ) : (
                    prescriptions.slice(0, 3).map(p => (
                      <div key={p._id} className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-800">{p.patient?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{p.diagnosis}</p>
                        <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
};

export default DoctorDashboard;
