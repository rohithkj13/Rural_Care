import React, { useState, useEffect } from 'react';
import { appointmentAPI, notificationAPI, reportAPI } from '../services/api';
import DoctorLayout from '../components/DoctorLayout';
import { FaUsers, FaSearch, FaCalendarAlt, FaFileMedical, FaPhone, FaEnvelope, FaChevronDown, FaChevronUp, FaRobot, FaUserMd, FaSave, FaEye } from 'react-icons/fa';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [patientReports, setPatientReports] = useState({}); // patientId -> reports[]
  const [activeTab, setActiveTab] = useState({}); // patientId -> 'appointments'|'reports'
  const [doctorNotes, setDoctorNotes] = useState({}); // reportId -> note text
  const [savingNote, setSavingNote] = useState(null); // reportId being saved
  const [noteToast, setNoteToast] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptRes, notifRes] = await Promise.all([
        appointmentAPI.getAll(),
        notificationAPI.getAll()
      ]);
      const appts = apptRes.data.data || [];
      setAppointments(appts);
      setNotifications(notifRes.data.data || []);

      // Build unique patients map
      const map = {};
      appts.forEach(a => {
        if (!a.patient?._id) return;
        const pid = a.patient._id;
        if (!map[pid]) {
          map[pid] = { ...a.patient, appointments: [] };
        }
        map[pid].appointments.push(a);
      });
      setPatients(Object.values(map));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const unread = notifications.filter(n => !n.isRead).length;

  const fetchPatientReports = async (patientId, force = false) => {
    if (patientReports[patientId] && !force) return;
    try {
      const res = await reportAPI.getPatientReports(patientId);
      const reports = res.data.data || [];
      setPatientReports(prev => ({ ...prev, [patientId]: reports }));
      const notes = {};
      reports.forEach(r => { if (r.doctorNote) notes[r._id] = r.doctorNote; });
      setDoctorNotes(prev => ({ ...prev, ...notes }));
    } catch { }
  };

  const handleSaveNote = async (reportId, patientId) => {
    const note = doctorNotes[reportId];
    if (!note?.trim()) return;
    setSavingNote(reportId);
    try {
      await reportAPI.addDoctorNote(reportId, { doctorNote: note });
      await fetchPatientReports(patientId, true); // force refresh
      setNoteToast('Note saved and patient notified!');
      setTimeout(() => setNoteToast(''), 3000);
    } catch {
      setNoteToast('Failed to save note');
      setTimeout(() => setNoteToast(''), 3000);
    } finally {
      setSavingNote(null);
    }
  };

  const handleExpand = (patientId) => {
    const next = expanded === patientId ? null : patientId;
    setExpanded(next);
    if (next) fetchPatientReports(next);
  };

  const STATUS_STYLES = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-gray-100 text-gray-600',
  };

  return (
    <DoctorLayout notifications={unread}>
      {noteToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-sm px-5 py-3 rounded-xl shadow-lg">{noteToast}</div>
      )}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">My Patients</h1>
          <span className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full font-medium">
            {filtered.length} patients
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search patients by name or email..."
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
            <FaUsers className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No patients found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(patient => (
              <div key={patient._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Patient Header */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleExpand(patient._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {patient.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{patient.name}</h3>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {patient.age && <span className="text-xs text-gray-500">Age {patient.age}</span>}
                        {patient.gender && <span className="text-xs text-gray-500 capitalize">{patient.gender}</span>}
                        {patient.phone && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <FaPhone className="text-emerald-400" /> {patient.phone}
                          </span>
                        )}
                        {patient.email && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <FaEnvelope className="text-blue-400" /> {patient.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-gray-700">{patient.appointments.length} visit{patient.appointments.length !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-gray-400">
                        Last: {new Date(patient.appointments[0]?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    {expanded === patient._id ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded === patient._id && (
                  <div className="border-t border-gray-100 px-5 pb-5">
                    {patient.medicalHistory && (
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs font-semibold text-amber-700 mb-1">Medical History</p>
                        <p className="text-sm text-amber-800">{patient.medicalHistory}</p>
                      </div>
                    )}
                    {patient.address && (
                      <p className="text-sm text-gray-500 mt-3">
                        <span className="font-medium text-gray-700">Address: </span>{patient.address}
                      </p>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4 mb-3">
                      <button
                        onClick={() => setActiveTab(prev => ({ ...prev, [patient._id]: 'appointments' }))}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          (activeTab[patient._id] || 'appointments') === 'appointments'
                            ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        <FaCalendarAlt className="inline mr-1 text-xs" /> Appointments
                      </button>
                      <button
                        onClick={() => setActiveTab(prev => ({ ...prev, [patient._id]: 'reports' }))}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          activeTab[patient._id] === 'reports'
                            ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        <FaFileMedical className="inline mr-1 text-xs" /> Reports
                      </button>
                    </div>

                    {/* Appointments Tab */}
                    {(activeTab[patient._id] || 'appointments') === 'appointments' && (
                      <div className="space-y-2">
                        {patient.appointments.map(apt => (
                          <div key={apt._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                            <div>
                              <span className="text-gray-700">
                                {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {apt.time}
                              </span>
                              {apt.symptoms && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{apt.symptoms}</p>}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[apt.status] || 'bg-gray-100 text-gray-600'}`}>
                              {apt.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reports Tab */}
                    {activeTab[patient._id] === 'reports' && (
                      <div className="space-y-4">
                        {!patientReports[patient._id] ? (
                          <div className="text-center py-6 text-gray-400 text-sm">Loading reports...</div>
                        ) : patientReports[patient._id].length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-xl">
                            <FaFileMedical className="text-3xl text-gray-200 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">No reports uploaded by this patient</p>
                          </div>
                        ) : (
                          patientReports[patient._id].map(report => (
                            <div key={report._id} className="border border-gray-100 rounded-xl overflow-hidden">
                              <div className="flex items-center justify-between p-3 bg-gray-50">
                                <div>
                                  <p className="font-semibold text-sm text-gray-800">{report.reportName}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{report.reportType}</span>
                                    <span className="text-xs text-gray-400">{new Date(report.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                  </div>
                                </div>
                                <a href={`http://localhost:5000${report.fileUrl}`} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                                  <FaEye /> View
                                </a>
                              </div>

                              {/* AI Summary */}
                              {report.aiSummary && (
                                <div className="p-3 bg-purple-50 border-t border-purple-100">
                                  <p className="text-xs font-semibold text-purple-700 flex items-center gap-1 mb-1"><FaRobot /> AI Overview</p>
                                  <p className="text-xs text-purple-800 leading-relaxed whitespace-pre-line">{report.aiSummary}</p>
                                </div>
                              )}

                              {/* Doctor Note */}
                              <div className="p-3 border-t border-gray-100">
                                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mb-2"><FaUserMd /> Your Assessment</p>
                                <textarea
                                  rows={3}
                                  value={doctorNotes[report._id] || ''}
                                  onChange={e => setDoctorNotes(prev => ({ ...prev, [report._id]: e.target.value }))}
                                  placeholder="Write your assessment, findings, and recommendations for this patient..."
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                                />
                                <button
                                  onClick={() => handleSaveNote(report._id, patient._id)}
                                  disabled={savingNote === report._id || !doctorNotes[report._id]?.trim()}
                                  className="mt-2 flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-lg disabled:opacity-50 transition-colors font-medium"
                                >
                                  <FaSave /> {savingNote === report._id ? 'Saving...' : 'Save & Notify Patient'}
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default DoctorPatients;
