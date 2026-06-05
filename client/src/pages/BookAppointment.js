import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import {
  FaUserMd, FaCalendarAlt, FaClock, FaVideo, FaPhone,
  FaComments, FaStar, FaHospital, FaBriefcase,
  FaArrowLeft, FaStethoscope
} from 'react-icons/fa';

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM'
];

const CONSULT_TYPES = [
  { value: 'video', label: 'Video Call', icon: FaVideo, color: 'text-blue-500', desc: 'Face-to-face consultation' },
  { value: 'audio', label: 'Audio Call', icon: FaPhone, color: 'text-green-500', desc: 'Voice consultation' },
  { value: 'chat', label: 'Chat', icon: FaComments, color: 'text-purple-500', desc: 'Text consultation' },
];

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    appointmentDate: '',
    appointmentTime: '',
    consultationType: 'video',
    symptoms: ''
  });

  useEffect(() => {
    doctorAPI.getById(doctorId)
      .then(res => setDoctor(res.data.data))
      .catch(() => setError('Failed to load doctor details'))
      .finally(() => setLoading(false));
  }, [doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.appointmentDate || !form.appointmentTime) {
      setError('Please select date and time');
      return;
    }
    // Redirect to payment page with appointment data
    navigate('/patient/payment', {
      state: {
        appointmentData: { doctorId, ...form },
        doctor
      }
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!doctor) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <FaUserMd className="text-5xl text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 font-semibold">Doctor not found</p>
        <button onClick={() => navigate('/patient/doctors')} className="mt-4 text-emerald-600 hover:underline text-sm">
          Back to Doctors
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/patient/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <FaStethoscope className="text-white text-xs" />
            </div>
            <span className="font-bold text-gray-900">RuralCare Connect</span>
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm text-gray-600">
            <Link to="/patient/dashboard" className="hover:text-emerald-600">Dashboard</Link>
            <Link to="/patient/doctors" className="hover:text-emerald-600">Doctors</Link>
            <Link to="/patient/appointments" className="hover:text-emerald-600">Appointments</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back */}
        <button onClick={() => navigate('/patient/doctors')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 mb-6 transition-colors">
          <FaArrowLeft className="text-xs" /> Back to Doctors
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Doctor Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <div className="text-center mb-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <span className="text-white text-2xl font-bold">
                    {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Dr. {doctor.name}</h3>
                <p className="text-emerald-600 font-semibold text-sm">{doctor.specialization}</p>
                <p className="text-gray-400 text-xs mt-0.5">{doctor.qualification}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaBriefcase className="text-blue-400 flex-shrink-0" />
                  <span>{doctor.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaHospital className="text-emerald-400 flex-shrink-0" />
                  <span className="text-xs">{doctor.hospital}</span>
                </div>
                {doctor.rating > 0 && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <FaStar className="text-yellow-400" />
                    <span>{doctor.rating.toFixed(1)} ({doctor.totalRatings} reviews)</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                <p className="text-2xl font-bold text-emerald-700">₹{doctor.consultationFee}</p>
                <p className="text-xs text-gray-400">per consultation</p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Appointment Details</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaCalendarAlt className="text-emerald-500" /> Select Date
                  </label>
                  <input
                    type="date"
                    value={form.appointmentDate}
                    onChange={e => setForm(f => ({ ...f, appointmentDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaClock className="text-emerald-500" /> Select Time Slot
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {TIME_SLOTS.map(slot => (
                      <button
                        key={slot} type="button"
                        onClick={() => setForm(f => ({ ...f, appointmentTime: slot }))}
                        className={`py-2 px-1 rounded-lg text-xs font-semibold border transition-all
                          ${form.appointmentTime === slot
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consultation Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Consultation Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {CONSULT_TYPES.map(({ value, label, icon: Icon, color, desc }) => (
                      <button
                        key={value} type="button"
                        onClick={() => setForm(f => ({ ...f, consultationType: value }))}
                        className={`p-4 rounded-xl border-2 text-center transition-all
                          ${form.consultationType === value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300 bg-white'}`}
                      >
                        <Icon className={`text-2xl mx-auto mb-1.5 ${form.consultationType === value ? 'text-emerald-600' : color}`} />
                        <p className="font-semibold text-sm text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Symptoms / Reason for Visit <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={form.symptoms}
                    onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))}
                    placeholder="Describe your symptoms or reason for consultation..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Fee Summary */}
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Consultation Fee</span>
                    <span className="font-bold text-emerald-700 text-lg">₹{doctor.consultationFee}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-500">GST (18%)</span>
                    <span className="text-gray-600">₹{Math.round((doctor.consultationFee || 0) * 0.18)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold mt-2 pt-2 border-t border-emerald-200">
                    <span className="text-gray-700">Total Payable</span>
                    <span className="text-emerald-700 text-lg">₹{(doctor.consultationFee || 0) + Math.round((doctor.consultationFee || 0) * 0.18)}</span>
                  </div>
                  <p className="text-xs text-emerald-600 mt-2">💳 Pay securely via UPI, Card, Net Banking or Wallet</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <FaCalendarAlt /> Proceed to Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
