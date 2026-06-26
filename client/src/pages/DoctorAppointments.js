import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { appointmentAPI, notificationAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import DoctorLayout from '../components/DoctorLayout';
import {
  FaCalendarAlt, FaCheck, FaTimes, FaVideo, FaPhone, FaComments,
  FaSearch, FaClock
} from 'react-icons/fa';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

const TYPE_ICON = { video: FaVideo, audio: FaPhone, chat: FaComments };

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let data = appointments;
    if (statusFilter !== 'all') data = data.filter(a => a.status === statusFilter);
    if (search) data = data.filter(a =>
      a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.symptoms?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [appointments, statusFilter, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptRes, notifRes] = await Promise.all([
        appointmentAPI.getAll(),
        notificationAPI.getAll()
      ]);
      setAppointments(apptRes.data.data || []);
      setNotifications(notifRes.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatus = async (id, status) => {
    setActionLoading(id + status);
    try {
      await appointmentAPI.updateStatus(id, { status });
      showToast(`Appointment ${status}`);
      fetchData();
    } catch { showToast('Failed to update', 'error'); }
    finally { setActionLoading(null); }
  };

  const counts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    accepted: appointments.filter(a => a.status === 'accepted').length,
    completed: appointments.filter(a => a.status === 'completed').length,
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

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <span className="text-sm text-gray-500">{appointments.length} total</span>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'accepted', 'completed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              {s} {counts[s] > 0 && <span className="ml-1 opacity-75">({counts[s]})</span>}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search by patient name or symptoms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <FaCalendarAlt className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(apt => {
              const TypeIcon = TYPE_ICON[apt.consultationType] || FaVideo;
              return (
                <div key={apt._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg flex-shrink-0">
                        {apt.patient?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-800">{apt.patient?.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[apt.status] || 'bg-gray-100 text-gray-600'}`}>
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {apt.patient?.age && `Age ${apt.patient.age}`}
                          {apt.patient?.gender && ` · ${apt.patient.gender}`}
                          {apt.patient?.phone && ` · ${apt.patient.phone}`}
                        </p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="text-emerald-500 text-xs" />
                            {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock className="text-blue-500 text-xs" /> {apt.time}
                          </span>
                          <span className="flex items-center gap-1 capitalize">
                            <TypeIcon className="text-purple-500 text-xs" /> {apt.consultationType}
                          </span>
                        </div>
                        {apt.symptoms && (
                          <p className="text-sm text-gray-500 mt-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <span className="font-medium text-gray-700">Symptoms: </span>{apt.symptoms}
                          </p>
                        )}
                        {apt.notes && (
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-medium text-gray-700">Notes: </span>{apt.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end flex-shrink-0">
                      {apt.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatus(apt._id, 'accepted')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <FaCheck className="text-xs" /> Accept
                          </button>
                          <button
                            onClick={() => handleStatus(apt._id, 'rejected')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <FaTimes className="text-xs" /> Reject
                          </button>
                        </div>
                      )}
                      {apt.status === 'accepted' && (
                        <div className="flex gap-2">
                          <Link
                            to={`/consultation/${apt._id}`}
                            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                          >
                            <FaVideo className="text-xs" /> Join Call
                          </Link>
                          <button
                            onClick={() => handleStatus(apt._id, 'completed')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <FaCheck className="text-xs" /> Complete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default DoctorAppointments;
