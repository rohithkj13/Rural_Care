import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { FaRobot, FaSearch } from 'react-icons/fa';

const AdminSymptomLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSymptomLogs();
      setLogs(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Prediction frequency
  const predFreq = {};
  logs.forEach(l => { if (l.prediction) predFreq[l.prediction] = (predFreq[l.prediction] || 0) + 1; });
  const topPredictions = Object.entries(predFreq).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const filtered = logs.filter(l =>
    l.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.prediction?.toLowerCase().includes(search.toLowerCase()) ||
    l.symptoms?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">AI Symptom Checker Logs</h1>
          <span className="bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full font-medium">{logs.length} checks</span>
        </div>

        {/* Top Predictions */}
        {topPredictions.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4">Top AI Predictions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {topPredictions.map(([pred, count]) => (
                <div key={pred} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-center">
                  <p className="text-xl font-bold text-indigo-600">{count}</p>
                  <p className="text-xs text-gray-600 mt-0.5 truncate">{pred}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" placeholder="Search by patient, prediction, or symptom..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <FaRobot className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No symptom check logs yet</p>
            <p className="text-xs text-gray-400 mt-1">Logs appear when patients use the AI Symptom Checker</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((log, i) => (
              <div key={log._id || i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                      <FaRobot />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{log.patient?.name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  {log.prediction && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Prediction</p>
                      <p className="text-sm font-semibold text-indigo-700">{log.prediction}</p>
                      {log.confidence && <p className="text-xs text-gray-400">{Math.round(log.confidence * 100)}% confidence</p>}
                    </div>
                  )}
                </div>
                {log.symptoms?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {log.symptoms.map((s, j) => (
                      <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSymptomLogs;
