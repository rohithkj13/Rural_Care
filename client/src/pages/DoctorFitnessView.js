import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fitnessAPI } from '../services/api';
import {
  FaStethoscope, FaWalking, FaFire, FaTint, FaWeight,
  FaArrowLeft, FaBell, FaSignOutAlt, FaUser, FaBullseye,
  FaCheckCircle, FaChevronDown, FaChevronUp, FaSave
} from 'react-icons/fa';

const StatBadge = ({ value, goal, label, color }) => {
  const met = goal && value >= goal;
  return (
    <div className="text-center">
      <p className={`font-bold text-sm ${color}`}>{value?.toLocaleString() || 0}</p>
      {goal && <p className="text-xs text-gray-400">/ {goal.toLocaleString()}</p>}
      <p className="text-xs text-gray-500">{label}</p>
      {met && <FaCheckCircle className="text-emerald-500 text-xs mx-auto mt-0.5" />}
    </div>
  );
};

export default function DoctorFitnessView() {
  const { user, logout } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [detailData, setDetailData] = useState({});
  const [goalForms, setGoalForms] = useState({});
  const [saving, setSaving] = useState(null);
  const [searchPatientId, setSearchPatientId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fitnessAPI.getDoctorPatients();
      setPatients(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleExpand = async (patientId) => {
    if (expanded === patientId) { setExpanded(null); return; }
    setExpanded(patientId);
    if (!detailData[patientId]) {
      try {
        const res = await fitnessAPI.getPatientFitness(patientId, 14);
        setDetailData(d => ({ ...d, [patientId]: res.data.data }));
        const latestGoals = res.data.data.logs?.[0]?.goals || {};
        setGoalForms(f => ({ ...f, [patientId]: { steps: latestGoals.steps || 10000, calories: latestGoals.calories || 2000, water: latestGoals.water || 8, weight: latestGoals.weight || '', doctorNotes: res.data.data.logs?.[0]?.doctorNotes || '' } }));
      } catch (err) { console.error(err); }
    }
  };

  const saveGoals = async (patientId) => {
    setSaving(patientId);
    try {
      const form = goalForms[patientId];
      await fitnessAPI.setPatientGoals(patientId, {
        goals: { steps: Number(form.steps), calories: Number(form.calories), water: Number(form.water), weight: form.weight ? Number(form.weight) : undefined },
        doctorNotes: form.doctorNotes
      });
      // Refresh detail
      const res = await fitnessAPI.getPatientFitness(patientId, 14);
      setDetailData(d => ({ ...d, [patientId]: res.data.data }));
    } catch (err) { console.error(err); }
    finally { setSaving(null); }
  };

  const searchPatient = async (e) => {
    e.preventDefault();
    if (!searchPatientId.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fitnessAPI.getPatientFitness(searchPatientId.trim(), 14);
      setSearchResult(res.data.data);
    } catch (err) { setSearchResult(null); alert('Patient not found'); }
    finally { setSearchLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/doctor/dashboard" className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
              <FaArrowLeft />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <FaStethoscope className="text-white text-sm" />
              </div>
              <span className="font-bold text-gray-900">Patient Fitness Monitor</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/doctor/notifications" className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
              <FaBell />
            </Link>
            <button onClick={logout} className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Patient Fitness Dashboard</h1>
          <p className="text-blue-100 text-sm mt-1">Monitor fitness data and set personalized goals for your patients</p>
        </div>

        {/* Search by Patient ID */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-3">Look Up Any Patient</h2>
          <form onSubmit={searchPatient} className="flex gap-2">
            <input value={searchPatientId} onChange={e => setSearchPatientId(e.target.value)}
              placeholder="Enter Patient ID (MongoDB ObjectId)"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <button type="submit" disabled={searchLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {searchResult && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <p className="font-semibold text-gray-900">{searchResult.patient?.name}</p>
              <p className="text-sm text-gray-500">{searchResult.patient?.email} · Age: {searchResult.patient?.age}</p>
              <p className="text-xs text-gray-400 mt-1">{searchResult.logs?.length} logs found in last 14 days</p>
            </div>
          )}
        </div>

        {/* Assigned Patients */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Assigned Patients ({patients.length})</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : patients.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <FaUser className="text-gray-300 text-4xl mx-auto mb-3" />
              <p className="text-gray-500">No patients assigned yet.</p>
              <p className="text-sm text-gray-400 mt-1">Use the search above to find patients and set their fitness goals.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patients.map(({ patient, logs }) => {
                const latest = logs[0];
                const isOpen = expanded === patient._id;
                const detail = detailData[patient._id];
                const gf = goalForms[patient._id] || {};

                return (
                  <div key={patient._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Patient Header */}
                    <button onClick={() => toggleExpand(patient._id)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {patient.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-500">{patient.email} · Age: {patient.age} · {patient.gender}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {latest && (
                          <div className="hidden sm:flex gap-4 text-center">
                            <StatBadge value={latest.steps} goal={latest.goals?.steps} label="Steps" color="text-emerald-600" />
                            <StatBadge value={latest.totalCaloriesConsumed} goal={latest.goals?.calories} label="Cal In" color="text-orange-600" />
                            <StatBadge value={latest.waterIntake} goal={latest.goals?.water} label="Water" color="text-blue-600" />
                          </div>
                        )}
                        {isOpen ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                      </div>
                    </button>

                    {/* Expanded Detail */}
                    {isOpen && (
                      <div className="border-t border-gray-100 p-5 space-y-5">
                        {/* Set Goals */}
                        <div className="bg-blue-50 rounded-xl p-4">
                          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FaBullseye className="text-blue-600" /> Set Fitness Goals</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { key: 'steps', label: 'Daily Steps', icon: FaWalking },
                              { key: 'calories', label: 'Calorie Goal', icon: FaFire },
                              { key: 'water', label: 'Water (glasses)', icon: FaTint },
                              { key: 'weight', label: 'Target Weight (kg)', icon: FaWeight },
                            ].map(({ key, label, icon: Icon }) => (
                              <div key={key}>
                                <label className="text-xs text-gray-600 font-medium mb-1 block">{label}</label>
                                <input type="number" min="0" value={gf[key] || ''} onChange={e => setGoalForms(f => ({ ...f, [patient._id]: { ...f[patient._id], [key]: e.target.value } }))}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
                              </div>
                            ))}
                          </div>
                          <div className="mt-3">
                            <label className="text-xs text-gray-600 font-medium mb-1 block">Doctor's Note for Patient</label>
                            <textarea rows={2} value={gf.doctorNotes || ''} onChange={e => setGoalForms(f => ({ ...f, [patient._id]: { ...f[patient._id], doctorNotes: e.target.value } }))}
                              placeholder="e.g. Increase steps gradually, avoid high-fat foods..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white resize-none" />
                          </div>
                          <button onClick={() => saveGoals(patient._id)} disabled={saving === patient._id}
                            className="mt-3 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
                            <FaSave className="text-xs" /> {saving === patient._id ? 'Saving...' : 'Save Goals & Note'}
                          </button>
                        </div>

                        {/* 14-day history */}
                        {detail?.logs?.length > 0 && (
                          <div>
                            <h3 className="font-bold text-gray-900 mb-3">14-Day Activity Log</h3>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                                    <th className="text-left py-2 pr-4">Date</th>
                                    <th className="text-right pr-4">Steps</th>
                                    <th className="text-right pr-4">Cal In</th>
                                    <th className="text-right pr-4">Cal Burned</th>
                                    <th className="text-right pr-4">Water</th>
                                    <th className="text-right">Weight</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {detail.logs.map(l => (
                                    <tr key={l._id} className="hover:bg-gray-50">
                                      <td className="py-2 pr-4 text-gray-600">{new Date(l.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                      <td className={`text-right pr-4 font-medium ${l.steps >= (l.goals?.steps || 10000) ? 'text-emerald-600' : 'text-gray-700'}`}>{(l.steps || 0).toLocaleString()}</td>
                                      <td className="text-right pr-4 text-gray-700">{l.totalCaloriesConsumed || 0}</td>
                                      <td className="text-right pr-4 text-gray-700">{l.caloriesBurned || 0}</td>
                                      <td className={`text-right pr-4 ${l.waterIntake >= (l.goals?.water || 8) ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>{l.waterIntake || 0}</td>
                                      <td className="text-right text-gray-700">{l.weight ? `${l.weight} kg` : '—'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
