import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FaCalendarAlt, FaClock, FaVideo, FaPhone, FaComments, FaCheckCircle, FaUserMd } from 'react-icons/fa';

const QuickBookAppointment = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    doctorId: '',
    specialization: 'All Specializations',
    appointmentDate: '',
    appointmentTime: '',
    consultationType: 'video',
    symptoms: ''
  });

  const specializations = [
    'All Specializations',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'General Physician',
    'Orthopedic',
    'Neurologist',
    'Gynecologist',
    'Psychiatrist',
    'ENT Specialist'
  ];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM'
  ];

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.specialization]);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (formData.specialization && formData.specialization !== 'All Specializations') {
        params.specialization = formData.specialization;
      }
      const res = await doctorAPI.getAll(params);
      setDoctors(res.data.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        return;
      }
      setError('Failed to load doctors. Please try again.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorChange = (doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId);
    setSelectedDoctor(doctor);
    setFormData({...formData, doctorId});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      await appointmentAPI.create(formData);
      setShowSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Appointment Booked Successfully!</h2>
              <p className="text-gray-600 mb-8">Your appointment has been confirmed</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Appointment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-semibold">Dr. {selectedDoctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialization:</span>
                  <span className="font-semibold">{selectedDoctor?.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">{new Date(formData.appointmentDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">{formData.appointmentTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation Type:</span>
                  <span className="font-semibold capitalize">{formData.consultationType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">Pending</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-blue-700">
                <strong>Note:</strong> Your appointment is pending confirmation from the doctor. You will receive a notification once confirmed.
              </p>
            </div>

            <button 
              onClick={() => navigate('/patient/appointments')}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Go to My Appointments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <nav className="bg-white shadow-md mb-8">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">RuralCare Connect</div>
          <div className="flex items-center gap-6">
            <Link to="/patient/dashboard" className="hover:text-primary">Dashboard</Link>
            <Link to="/patient/book-appointment" className="text-primary font-semibold">Book Appointment</Link>
            <Link to="/patient/doctors" className="hover:text-primary">Doctors</Link>
            <Link to="/patient/appointments" className="hover:text-primary">Appointments</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Book Appointment</h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Specialization
                </label>
                <select 
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" 
                  value={formData.specialization} 
                  onChange={(e) => setFormData({...formData, specialization: e.target.value, doctorId: ''})}
                >
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  <FaUserMd className="inline mr-2" />
                  Select Doctor {doctors.length > 0 && `(${doctors.length} available)`}
                </label>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading doctors...</p>
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="text-center py-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-yellow-700">No doctors found. Please check if backend is running and database is seeded.</p>
                    <button 
                      onClick={fetchDoctors}
                      className="mt-2 text-primary underline hover:text-green-600"
                    >
                      Retry Loading Doctors
                    </button>
                  </div>
                ) : (
                  <select 
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" 
                    value={formData.doctorId} 
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    required
                  >
                    <option value="">Choose a doctor ({doctors.length} available)</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name} - {doctor.specialization} - ₹{doctor.consultationFee}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedDoctor && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Doctor Details</h3>
                  <p className="text-sm text-gray-600">Qualification: {selectedDoctor.qualification}</p>
                  <p className="text-sm text-gray-600">Experience: {selectedDoctor.experience} years</p>
                  <p className="text-sm text-gray-600">Hospital: {selectedDoctor.hospital}</p>
                  <p className="text-sm text-gray-700 font-semibold mt-2">Fee: ₹{selectedDoctor.consultationFee}</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  Select Date
                </label>
                <input 
                  type="date" 
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" 
                  value={formData.appointmentDate} 
                  onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})} 
                  required 
                  min={new Date().toISOString().split('T')[0]} 
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  <FaClock className="inline mr-2" />
                  Select Time
                </label>
                <select 
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" 
                  value={formData.appointmentTime} 
                  onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})} 
                  required
                >
                  <option value="">Choose a time slot</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Consultation Type</label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, consultationType: 'video'})}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.consultationType === 'video' 
                        ? 'border-primary bg-green-50' 
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    <FaVideo className={`text-3xl mx-auto mb-2 ${formData.consultationType === 'video' ? 'text-primary' : 'text-gray-400'}`} />
                    <p className="font-semibold">Video</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, consultationType: 'audio'})}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.consultationType === 'audio' 
                        ? 'border-primary bg-green-50' 
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    <FaPhone className={`text-3xl mx-auto mb-2 ${formData.consultationType === 'audio' ? 'text-primary' : 'text-gray-400'}`} />
                    <p className="font-semibold">Audio</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, consultationType: 'chat'})}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.consultationType === 'chat' 
                        ? 'border-primary bg-green-50' 
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    <FaComments className={`text-3xl mx-auto mb-2 ${formData.consultationType === 'chat' ? 'text-primary' : 'text-gray-400'}`} />
                    <p className="font-semibold">Chat</p>
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Symptoms / Reason for Visit</label>
                <textarea 
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" 
                  rows="4" 
                  value={formData.symptoms} 
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})} 
                  placeholder="Describe your symptoms or reason for consultation"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={submitting || !formData.doctorId}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Booking...
                  </span>
                ) : (
                  'Confirm Appointment'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBookAppointment;
