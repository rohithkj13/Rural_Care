import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { FaUsers, FaMapMarkerAlt, FaUserMd } from 'react-icons/fa';

const BarChart = ({ data, keyField, valueField, color = 'bg-indigo-500', maxBars = 10 }) => {
  const items = (data || []).slice(0, maxBars);
  const max = Math.max(...items.map(d => d[valueField] || 0), 1);
  if (items.length === 0) return <p className="text-gray-400 text-sm text-center py-6">No data available</p>;
  return (
    <div className="flex items-end gap-1 h-36 mt-2">
      {items.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative min-w-0">
          <div className={`w-full ${color} rounded-t-sm`} style={{ height: `${((d[valueField] || 0) / max) * 100}%`, minHeight: d[valueField] > 0 ? '4px' : '0' }} />
          <span className="text-gray-400 truncate w-full text-center" style={{ fontSize: '9px' }}>{d[keyField]}</span>
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
            {d[valueField]}
          </div>
        </div>
      ))}
    </div>
  );
};

const HorizBar = ({ name, count, max, color }) => {
  const pct = Math.round((count / Math.max(max, 1)) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 truncate max-w-xs">{name}</span>
        <span className="text-gray-500 font-medium ml-2">{count}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const COLORS = ['bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500', 'bg-pink-500'];

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAnalytics();
      setData(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const ruralPct = data ? Math.round((data.ruralPatients / Math.max(data.totalPatients, 1)) * 100) : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">System Analytics</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FaUsers className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{data?.totalPatients || 0}</p>
                  <p className="text-sm text-gray-500">Total Patients</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-emerald-600 text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{data?.ruralPatients || 0}</p>
                  <p className="text-sm text-gray-500">Rural Area Patients ({ruralPct}%)</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-medium text-gray-700 mb-2">Rural Coverage</p>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${ruralPct}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{ruralPct}% of patients from rural areas</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Daily Registrations */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-1">Daily Registrations (Last 30 Days)</h2>
                <p className="text-xs text-gray-400 mb-3">New users joining the platform</p>
                <BarChart data={data?.dailyRegistrations} keyField="date" valueField="count" color="bg-blue-500" maxBars={15} />
              </div>

              {/* Consultation Types */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-4">Consultation Types</h2>
                {(data?.consultationTypes || []).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {(data?.consultationTypes || []).map((t, i) => {
                      const total = data.consultationTypes.reduce((s, x) => s + x.count, 0);
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 capitalize">{t.type || 'Unknown'}</span>
                            <span className="text-gray-500">{t.count} ({Math.round((t.count / Math.max(total, 1)) * 100)}%)</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${COLORS[i % COLORS.length]} rounded-full`} style={{ width: `${(t.count / Math.max(total, 1)) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top Diseases */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-4">Most Common Diseases Reported</h2>
                {(data?.topDiseases || []).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">No prescription data yet</p>
                ) : (
                  <div className="space-y-3">
                    {(data?.topDiseases || []).map((d, i) => (
                      <HorizBar key={i} name={d.name} count={d.count} max={data.topDiseases[0]?.count} color={COLORS[i % COLORS.length]} />
                    ))}
                  </div>
                )}
              </div>

              {/* Top Doctors by Appointments */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUserMd className="text-indigo-500" /> Most Active Doctors
                </h2>
                {(data?.topDoctors || []).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {(data?.topDoctors || []).map((doc, i) => (
                      <div key={doc._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">Dr. {doc.name}</p>
                          <p className="text-xs text-gray-400">{doc.specialization}</p>
                        </div>
                        <span className="text-sm font-bold text-indigo-600">{doc.appointmentCount}</span>
                        <span className="text-xs text-gray-400">appts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
