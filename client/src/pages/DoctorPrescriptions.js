import React, { useState, useEffect } from 'react';
import { prescriptionAPI, appointmentAPI, notificationAPI } from '../services/api';
import DoctorLayout from '../components/DoctorLayout';
import { FaFileMedical, FaPlus, FaTrash, FaTimes, FaPrint, FaSearch } from 'react-icons/fa';

const emptyMed = { name: '', dosage: '', duration: '', instructions: '' };

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formMode, setFormMode] = useState('appointment'); // 'appointment' | 'patientId'
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searching, setSearching] = useState(false);
  const [form, setForm] = useState({
    patient: '', appointment: '', diagnosis: '', advice: '', followUpDate: '',
    medicines: [{ ...emptyMed }]
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [presRes, apptRes, notifRes] = await Promise.all([
        prescriptionAPI.getAll(),
        appointmentAPI.getAll(),
        notificationAPI.getAll()
      ]);
      setPrescriptions(presRes.data.data || []);
      const appts = apptRes.data.data || [];
      // Only completed/accepted appointments for prescriptions
      setAppointments(appts.filter(a => ['accepted', 'completed'].includes(a.status)));
      setNotifications(notifRes.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAppointmentSelect = (apptId) => {
    const apt = appointments.find(a => a._id === apptId);
    setForm(f => ({ ...f, appointment: apptId, patient: apt?.patient?._id || '' }));
  };

  const handlePatientSearch = async () => {
    if (!patientSearch.trim()) return;
    setSearching(true);
    try {
      const res = await prescriptionAPI.searchPatient(patientSearch.trim());
      setPatientResults(res.data.data || []);
    } catch { showToast('Search failed', 'error'); }
    finally { setSearching(false); }
  };

  const selectPatient = (p) => {
    setSelectedPatient(p);
    setPatientResults([]);
    setForm(f => ({ ...f, patient: p._id, appointment: '' }));
  };

  const resetForm = () => {
    setShowForm(false);
    setFormMode('appointment');
    setPatientSearch('');
    setPatientResults([]);
    setSelectedPatient(null);
    setForm({ patient: '', appointment: '', diagnosis: '', advice: '', followUpDate: '', medicines: [{ ...emptyMed }] });
  };

  const addMedicine = () => setForm(f => ({ ...f, medicines: [...f.medicines, { ...emptyMed }] }));
  const removeMedicine = (i) => setForm(f => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }));
  const updateMedicine = (i, field, val) => setForm(f => ({
    ...f,
    medicines: f.medicines.map((m, idx) => idx === i ? { ...m, [field]: val } : m)
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient || !form.diagnosis || form.medicines.some(m => !m.name || !m.dosage || !m.duration)) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    if (formMode === 'appointment' && !form.appointment) {
      showToast('Please select an appointment', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await prescriptionAPI.create(form);
      showToast('Prescription created successfully');
      resetForm();
      fetchData();
    } catch { showToast('Failed to create prescription', 'error'); }
    finally { setSubmitting(false); }
  };

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  const filtered = filteredPrescriptions;
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
          <h1 className="text-2xl font-bold text-gray-800">Prescriptions</h1>
          <button
            onClick={() => { setShowForm(true); setFormMode('appointment'); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FaPlus /> New Prescription
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search by patient or diagnosis..."
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
            <FaFileMedical className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No prescriptions yet</p>
            <button onClick={() => setShowForm(true)} className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-emerald-700">
              Create First Prescription
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => (
              <div key={p._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold flex-shrink-0">
                      {p.patient?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{p.patient?.name}</h3>
                      <p className="text-sm text-gray-500">
                        {p.patient?.patientId && <span className="text-emerald-700 font-semibold mr-2">{p.patient.patientId}</span>}
                        {p.patient?.age && `Age ${p.patient.age}`}{p.patient?.gender && ` · ${p.patient.gender}`}
                      </p>
                      <p className="text-sm font-medium text-gray-700 mt-1">{p.diagnosis}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-emerald-300 transition-colors"
                  >
                    <FaPrint /> Print
                  </button>
                </div>

                {/* Medicines */}
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Medicines</p>
                  <div className="space-y-2">
                    {p.medicines?.map((m, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                        <div>
                          <span className="font-medium text-gray-800">{m.name}</span>
                          <span className="text-gray-500"> · {m.dosage} · {m.duration}</span>
                          {m.instructions && <p className="text-xs text-gray-400 mt-0.5">{m.instructions}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {p.advice && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Advice</p>
                    <p className="text-sm text-blue-800">{p.advice}</p>
                  </div>
                )}
                {p.followUpDate && (
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium text-gray-700">Follow-up: </span>
                    {new Date(p.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Prescription Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-800">New Prescription</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Mode Toggle */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
                <button type="button"
                  onClick={() => { setFormMode('appointment'); setSelectedPatient(null); setForm(f => ({ ...f, patient: '', appointment: '' })); }}
                  className={`flex-1 py-2 transition-colors ${ formMode === 'appointment' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50' }`}>
                  Via Appointment
                </button>
                <button type="button"
                  onClick={() => { setFormMode('patientId'); setForm(f => ({ ...f, appointment: '' })); }}
                  className={`flex-1 py-2 transition-colors ${ formMode === 'patientId' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50' }`}>
                  Search by Patient ID
                </button>
              </div>

              {formMode === 'appointment' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Appointment <span className="text-red-500">*</span></label>
                  <select
                    value={form.appointment}
                    onChange={e => handleAppointmentSelect(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  >
                    <option value="">-- Select appointment --</option>
                    {appointments.map(a => (
                      <option key={a._id} value={a._id}>
                        {a.patient?.name} · {new Date(a.date).toLocaleDateString()} · {a.time}
                      </option>
                    ))}
                  </select>
                  {appointments.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No accepted/completed appointments found.</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Patient <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={e => setPatientSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handlePatientSearch())}
                      placeholder="Enter Patient ID (RC-0001) or name..."
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                    <button type="button" onClick={handlePatientSearch}
                      className="bg-emerald-600 text-white px-4 rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-1">
                      {searching ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaSearch />}
                    </button>
                  </div>
                  {patientResults.length > 0 && (
                    <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      {patientResults.map(p => (
                        <button key={p._id} type="button" onClick={() => selectPatient(p)}
                          className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-sm border-b border-gray-100 last:border-0 flex items-center justify-between">
                          <span className="font-medium text-gray-800">{p.name}</span>
                          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">{p.patientId}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedPatient && (
                    <div className="mt-2 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">{selectedPatient.name}</p>
                        <p className="text-xs text-emerald-600">{selectedPatient.patientId} · {selectedPatient.phone}</p>
                      </div>
                      <button type="button" onClick={() => { setSelectedPatient(null); setForm(f => ({ ...f, patient: '' })); }}
                        className="text-emerald-400 hover:text-red-500">
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.diagnosis}
                  onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                  placeholder="e.g. Viral fever, Hypertension"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  required
                />
              </div>

              {/* Medicines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Medicines <span className="text-red-500">*</span></label>
                  <button type="button" onClick={addMedicine} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    <FaPlus /> Add Medicine
                  </button>
                </div>
                <div className="space-y-3">
                  {form.medicines.map((med, i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500">Medicine {i + 1}</span>
                        {form.medicines.length > 1 && (
                          <button type="button" onClick={() => removeMedicine(i)} className="text-red-400 hover:text-red-600">
                            <FaTrash className="text-xs" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Medicine name *"
                          value={med.name}
                          onChange={e => updateMedicine(i, 'name', e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Dosage * (e.g. 500mg)"
                          value={med.dosage}
                          onChange={e => updateMedicine(i, 'dosage', e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Duration * (e.g. 5 days)"
                          value={med.duration}
                          onChange={e => updateMedicine(i, 'duration', e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Instructions (e.g. After meals)"
                          value={med.instructions}
                          onChange={e => updateMedicine(i, 'instructions', e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advice / Notes</label>
                <textarea
                  value={form.advice}
                  onChange={e => setForm(f => ({ ...f, advice: e.target.value }))}
                  placeholder="Dietary advice, rest, lifestyle changes..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                />
              </div>

              {/* Follow-up */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={form.followUpDate}
                  onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
};

export default DoctorPrescriptions;
