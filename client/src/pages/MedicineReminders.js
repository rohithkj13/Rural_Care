import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { reminderAPI } from '../services/api';
import { FaPills, FaClock, FaBell, FaPlus, FaTrash, FaEdit, FaStethoscope, FaCheckCircle, FaTimes } from 'react-icons/fa';

const EMPTY_FORM = {
  medicineName: '', dosage: '', frequency: 'daily',
  reminderType: 'medication', repeat: 'daily',
  times: ['09:00 AM'], startDate: '', endDate: '', notes: ''
};

const to24h = (t) => {
  if (!t) return '09:00';
  if (!t.includes(' ')) return t;
  const [time, period] = t.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const to12h = (time24) => {
  if (!time24 || !time24.includes(':')) return '09:00 AM';
  const [hh, mm] = time24.split(':').map(Number);
  const period = hh >= 12 ? 'PM' : 'AM';
  const hour = hh % 12 || 12;
  return `${hour.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')} ${period}`;
};

const formatTime = (t) => {
  if (!t) return '';
  if (t.includes('AM') || t.includes('PM')) return t;
  return to12h(t);
};

const MedicineReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [notifPermission, setNotifPermission] = useState('default');
  const [editingId, setEditingId] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);

  const firedToday = useRef(new Set());
  const intervalRef = useRef(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if ('Notification' in window) setNotifPermission(Notification.permission);
    fetchReminders();
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const active = reminders.filter(r => r.reminderEnabled !== false);
    if (!active.length) return;
    checkReminders(active);
    intervalRef.current = setInterval(() => checkReminders(active), 30000);
    return () => clearInterval(intervalRef.current);
  }, [reminders]); // eslint-disable-line

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await reminderAPI.getAll();
      setReminders(res.data.data || []);
    } catch (err) {
      showToast('Failed to load reminders. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId('');
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (reminder) => {
    setEditingId(reminder._id);
    setFormData({
      medicineName: reminder.medicineName || '',
      dosage: reminder.dosage || '',
      frequency: reminder.frequency || 'daily',
      reminderType: reminder.reminderType || 'medication',
      repeat: reminder.repeat || 'daily',
      times: reminder.times?.length ? reminder.times : ['09:00 AM'],
      startDate: reminder.startDate ? String(reminder.startDate).slice(0, 10) : '',
      endDate: reminder.endDate ? String(reminder.endDate).slice(0, 10) : '',
      notes: reminder.notes || ''
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId('');
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medicineName.trim()) return showToast('Medicine name is required.', 'error');
    if (!formData.dosage.trim()) return showToast('Dosage is required.', 'error');
    if (!formData.startDate) return showToast('Start date is required.', 'error');
    if (!formData.endDate) return showToast('End date is required.', 'error');
    if (formData.endDate < formData.startDate) return showToast('End date must be after start date.', 'error');

    setSubmitting(true);
    try {
      if (editingId) {
        await reminderAPI.update(editingId, formData);
        showToast('Reminder updated successfully.');
      } else {
        await reminderAPI.create(formData);
        showToast('Reminder created! You will be notified at the set times.');
      }
      closeForm();
      fetchReminders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save reminder.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReminder = async (reminder) => {
    const newVal = !reminder.reminderEnabled;
    try {
      await reminderAPI.update(reminder._id, { reminderEnabled: newVal });
      setReminders(prev => prev.map(r => r._id === reminder._id ? { ...r, reminderEnabled: newVal } : r));
      showToast(newVal ? 'Reminder enabled.' : 'Reminder paused.');
    } catch {
      showToast('Failed to update reminder.', 'error');
    }
  };

  const deleteReminder = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await reminderAPI.delete(id);
      setReminders(prev => prev.filter(r => r._id !== id));
      showToast('Reminder deleted.');
    } catch {
      showToast('Failed to delete reminder.', 'error');
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') showToast('Notifications enabled! You will receive medicine reminders.');
  };

  const checkReminders = (activeReminders) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    activeReminders.forEach(reminder => {
      const start = new Date(reminder.startDate); start.setHours(0, 0, 0, 0);
      const end = new Date(reminder.endDate); end.setHours(23, 59, 59, 999);
      if (now < start || now > end) return;

      (reminder.times || []).forEach(time => {
        const normalized = to24h(time);
        const key = `${reminder._id}-${normalized}-${todayStr}`;
        if (firedToday.current.has(key)) return;
        if (currentTime === normalized) {
          firedToday.current.add(key);
          new Notification('💊 Medicine Reminder', {
            body: `Time to take ${reminder.medicineName} — ${reminder.dosage}`,
            icon: '/logo192.png',
            tag: `med-${reminder._id}`,
            requireInteraction: true
          });
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        }
      });
    });
  };

  const isActive = (r) => {
    const now = new Date();
    return r.reminderEnabled !== false &&
      now >= new Date(r.startDate) &&
      now <= new Date(new Date(r.endDate).setHours(23, 59, 59, 999));
  };

  const addTimeSlot = () => setFormData(f => ({ ...f, times: [...f.times, '09:00 AM'] }));
  const updateTimeSlot = (i, v) => setFormData(f => { const t = [...f.times]; t[i] = v; return { ...f, times: t }; });
  const removeTimeSlot = (i) => setFormData(f => ({ ...f, times: f.times.filter((_, idx) => idx !== i) }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 text-white text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all
          ${toastType === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>
          <FaCheckCircle /> {toast}
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/patient/dashboard" className="flex items-center gap-2">
            <FaStethoscope className="text-emerald-600" />
            <span className="font-bold text-gray-900">RuralCare Connect</span>
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm text-gray-600">
            <Link to="/patient/dashboard" className="hover:text-emerald-600">Dashboard</Link>
            <Link to="/patient/prescriptions" className="hover:text-emerald-600">Prescriptions</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaPills className="text-emerald-600" /> Medicine Reminders
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Get browser notifications when it's time to take your medicine</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <FaPlus /> Add Reminder
          </button>
        </div>

        {/* Notification Permission Banner */}
        {notifPermission !== 'granted' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FaBell className="text-amber-500 text-xl flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Enable browser notifications</p>
                <p className="text-xs text-amber-600">Allow notifications to receive medicine reminders on time</p>
              </div>
            </div>
            <button
              onClick={requestPermission}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-4 py-2 rounded-lg font-semibold flex-shrink-0 transition-colors"
            >
              Enable Now
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reminders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaBell className="text-4xl text-emerald-300" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">No reminders set</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">Create a reminder to never miss your medicine</p>
            <button
              onClick={openAdd}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              <FaPlus className="inline mr-2" />Create First Reminder
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {reminders.map(reminder => {
              const active = isActive(reminder);
              const enabled = reminder.reminderEnabled !== false;
              return (
                <div
                  key={reminder._id}
                  className={`bg-white rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md
                    ${active ? 'border-emerald-200' : 'border-gray-100 opacity-80'}`}
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{reminder.medicineName}</h3>
                        {active ? (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                        ) : enabled ? (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Expired</span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-medium">Paused</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{reminder.dosage}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <button
                        onClick={() => toggleReminder(reminder)}
                        title={enabled ? 'Pause reminder' : 'Enable reminder'}
                        className={`text-base px-2 py-1.5 rounded-lg transition-colors
                          ${enabled ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        {enabled ? '🔔' : '🔕'}
                      </button>
                      <button
                        onClick={() => openEdit(reminder)}
                        className="p-1.5 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => deleteReminder(reminder._id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaClock className="text-emerald-500 flex-shrink-0 text-xs" />
                      <span className="font-medium">Times:</span>
                      <span>{(reminder.times || []).map(formatTime).join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaBell className="text-blue-400 flex-shrink-0 text-xs" />
                      <span className="font-medium">Frequency:</span>
                      <span className="capitalize">{reminder.frequency}</span>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                    {new Date(reminder.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {' — '}
                    {new Date(reminder.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {reminder.notes && <p className="mt-1 italic text-gray-400">{reminder.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Reminder' : 'Create Medicine Reminder'}
              </h2>
              <button onClick={closeForm} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Medicine Name & Dosage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Paracetamol"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50 focus:bg-white"
                    value={formData.medicineName}
                    onChange={e => setFormData(f => ({ ...f, medicineName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. 1 tablet"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50 focus:bg-white"
                    value={formData.dosage}
                    onChange={e => setFormData(f => ({ ...f, dosage: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Type & Frequency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                    value={formData.reminderType}
                    onChange={e => setFormData(f => ({ ...f, reminderType: e.target.value }))}
                  >
                    <option value="medication">Medication</option>
                    <option value="appointment">Appointment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency <span className="text-red-400">*</span></label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                    value={formData.frequency}
                    onChange={e => setFormData(f => ({ ...f, frequency: e.target.value }))}
                  >
                    <option value="daily">Once Daily</option>
                    <option value="twice">Twice Daily</option>
                    <option value="thrice">Thrice Daily</option>
                  </select>
                </div>
              </div>

              {/* Repeat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                  value={formData.repeat}
                  onChange={e => setFormData(f => ({ ...f, repeat: e.target.value }))}
                >
                  <option value="none">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays only</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Times <span className="text-red-400">*</span></label>
                {formData.times.map((time, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="time"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                      value={to24h(time)}
                      onChange={e => updateTimeSlot(i, to12h(e.target.value))}
                    />
                    {formData.times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(i)}
                        className="bg-red-100 text-red-500 hover:bg-red-200 px-3 rounded-xl text-sm font-bold transition-colors"
                      >✕</button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="text-emerald-600 text-sm hover:underline font-medium"
                >
                  + Add another time
                </button>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                    value={formData.startDate}
                    onChange={e => setFormData(f => ({ ...f, startDate: e.target.value }))}
                    min={today}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                    value={formData.endDate}
                    onChange={e => setFormData(f => ({ ...f, endDate: e.target.value }))}
                    min={formData.startDate || today}
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none bg-gray-50"
                  placeholder="e.g. Take after meals, with water"
                  value={formData.notes}
                  onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : editingId ? 'Save Changes' : 'Create Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineReminders;
