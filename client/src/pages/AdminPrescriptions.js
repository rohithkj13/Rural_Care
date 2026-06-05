import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { FaFileMedical, FaSearch, FaPrint } from 'react-icons/fa';

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPrescriptions({ search });
      setPrescriptions(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = prescriptions.filter(p =>
    p.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.doctor?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  // Medicine frequency analysis
  const medFreq = {};
  prescriptions.forEach(p => p.medicines?.forEach(m => {
    const name = m.name?.toLowerCase();
    if (name) medFreq[name] = (medFreq[name] || 0) + 1;
  }));
  const topMeds = Object.entries(medFreq).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Prescription Monitoring</h1>
          <span className="bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full font-medium">{prescriptions.length} total</span>
        </div>

        {/* Top Medicines */}
        {topMeds.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4">Most Prescribed Medicines</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {topMeds.map(([name, count]) => (
                <div key={name} className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-center">
                  <p className="text-lg font-bold text-orange-600">{count}</p>
                  <p className="text-xs text-gray-600 capitalize mt-0.5 truncate">{name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" placeholder="Search by patient, doctor, or diagnosis..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <FaFileMedical className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No prescriptions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => (
              <div key={p._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold flex-shrink-0">
                      {p.patient?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-800">{p.patient?.name}</h3>
                        <span className="text-xs text-gray-400">→</span>
                        <span className="text-sm text-indigo-600 font-medium">Dr. {p.doctor?.name}</span>
                        <span className="text-xs text-gray-400">{p.doctor?.specialization}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mt-1">{p.diagnosis}</p>
                      <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {p.medicines?.map((m, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      {m.name} · {m.dosage} · {m.duration}
                    </span>
                  ))}
                </div>

                {p.advice && (
                  <p className="text-xs text-gray-500 mt-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                    <span className="font-medium text-blue-700">Advice: </span>{p.advice}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPrescriptions;
