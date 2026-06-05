import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import {
  FaUsers, FaUserMd, FaCalendarAlt, FaFileMedical, FaClock,
  FaVideo, FaExclamationCircle, FaRobot, FaArrowRight, FaUserCheck, FaTint, FaNewspaper, FaDownload
} from 'react-icons/fa';

const StatCard = ({ icon: Icon, value, label, color, bg, to }) => (
  <Link to={to || '#'} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`text-2xl ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </Link>
);

const BarChart = ({ data, color = 'bg-indigo-500', label = 'count' }) => {
  if (!data || data.length === 0) return <p className="text-gray-400 text-sm text-center py-4">No data</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className={`w-full ${color} rounded-t-sm transition-all`}
            style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
          />
          <span className="text-xs text-gray-400 truncate w-full text-center" style={{ fontSize: '9px' }}>
            {d.date || d.name || d.type}
          </span>
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
            {d.count} {label}
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const downloadReport = async (type, format) => {
    try {
      const res = await adminAPI.downloadReport(type, format);
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.${format === 'excel' ? 'xlsx' : format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const badge = {
    '/admin/doctors': stats?.pendingDoctors || 0,
    '/admin/complaints': stats?.openComplaints || 0,
  };

  const statCards = stats ? [
    { icon: FaUsers, value: stats.totalPatients, label: 'Total Patients', color: 'text-blue-600', bg: 'bg-blue-50', to: '/admin/patients' },
    { icon: FaUserMd, value: stats.totalDoctors, label: 'Active Doctors', color: 'text-emerald-600', bg: 'bg-emerald-50', to: '/admin/doctors' },
    { icon: FaCalendarAlt, value: stats.todayAppointments, label: "Today's Appointments", color: 'text-purple-600', bg: 'bg-purple-50', to: '/admin/doctors' },
    { icon: FaVideo, value: stats.activeConsultations, label: 'Active Consultations', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: FaFileMedical, value: stats.totalPrescriptions, label: 'Prescriptions', color: 'text-orange-600', bg: 'bg-orange-50', to: '/admin/prescriptions' },
    { icon: FaClock, value: stats.pendingAppointments, label: 'Pending Requests', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: FaUserCheck, value: stats.pendingDoctors, label: 'Doctors Pending Approval', color: 'text-red-600', bg: 'bg-red-50', to: '/admin/doctors' },
    { icon: FaRobot, value: stats.totalSymptomChecks, label: 'AI Symptom Checks', color: 'text-indigo-600', bg: 'bg-indigo-50', to: '/admin/symptom-logs' },
    { icon: FaTint, value: stats.totalBloodDonors, label: 'Blood Donors', color: 'text-rose-600', bg: 'bg-rose-50', to: '/admin/blood-donors' },
    { icon: FaNewspaper, value: stats.totalHealthFeeds, label: 'Health Feed Posts', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ] : [];

  return (
    <AdminLayout badge={badge}>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-indigo-900 rounded-2xl p-6 text-white">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-300 mt-1 text-sm">
              System overview · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {stats?.pendingDoctors > 0 && (
              <div className="mt-3 flex items-center gap-2 bg-yellow-500 bg-opacity-20 border border-yellow-400 border-opacity-30 rounded-lg px-4 py-2 text-yellow-200 text-sm">
                <FaExclamationCircle />
                {stats.pendingDoctors} doctor{stats.pendingDoctors > 1 ? 's' : ''} awaiting approval
                <Link to="/admin/doctors" className="ml-auto underline text-yellow-300 flex items-center gap-1">
                  Review <FaArrowRight className="text-xs" />
                </Link>
              </div>
            )}
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((s, i) => <StatCard key={i} {...s} />)}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Daily Appointments Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">Daily Appointments (Last 7 Days)</h2>
              </div>
              <BarChart data={stats?.dailyAppointments} color="bg-indigo-500" label="appointments" />
            </div>

            {/* Top Diagnoses */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-4">Most Common Diagnoses</h2>
              {stats?.topDiagnoses?.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No prescription data yet</p>
              ) : (
                <div className="space-y-2">
                  {(stats?.topDiagnoses || []).map((d, i) => {
                    const max = stats.topDiagnoses[0]?.count || 1;
                    const pct = Math.round((d.count / max) * 100);
                    const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 truncate max-w-xs">{d.name}</span>
                          <span className="text-gray-500 font-medium ml-2">{d.count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { to: '/admin/doctors', label: 'Manage Doctors', icon: FaUserMd, color: 'text-emerald-600 bg-emerald-50' },
                { to: '/admin/patients', label: 'Manage Patients', icon: FaUsers, color: 'text-blue-600 bg-blue-50' },
                { to: '/admin/prescriptions', label: 'Prescriptions', icon: FaFileMedical, color: 'text-orange-600 bg-orange-50' },
                { to: '/admin/symptom-logs', label: 'AI Logs', icon: FaRobot, color: 'text-indigo-600 bg-indigo-50' },
                { to: '/admin/analytics', label: 'Analytics', icon: FaCalendarAlt, color: 'text-purple-600 bg-purple-50' },
                { to: '/admin/complaints', label: 'Complaints', icon: FaExclamationCircle, color: 'text-red-600 bg-red-50' },
                { to: '/admin/blood-donors', label: 'Blood Donors', icon: FaTint, color: 'text-rose-600 bg-rose-50' },
              ].map(({ to, label, icon: Icon, color }) => (
                <Link key={to} to={to} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="text-lg" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-4">Recent Activity</h2>
              <div className="space-y-2 text-sm">
                {(stats?.recentActivity || []).map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg border border-gray-100">
                    <p className="text-gray-700">{item.message}</p>
                    <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-4">Download Reports</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <button onClick={() => downloadReport('daily', 'pdf')} className="border rounded-lg p-3 hover:bg-gray-50 flex items-center gap-2"><FaDownload /> Daily PDF</button>
                <button onClick={() => downloadReport('daily', 'excel')} className="border rounded-lg p-3 hover:bg-gray-50 flex items-center gap-2"><FaDownload /> Daily Excel</button>
                <button onClick={() => downloadReport('monthly', 'pdf')} className="border rounded-lg p-3 hover:bg-gray-50 flex items-center gap-2"><FaDownload /> Monthly PDF</button>
                <button onClick={() => downloadReport('monthly', 'excel')} className="border rounded-lg p-3 hover:bg-gray-50 flex items-center gap-2"><FaDownload /> Monthly Excel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
