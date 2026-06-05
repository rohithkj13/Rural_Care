import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { appointmentAPI, reviewAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  FaCalendarAlt, FaClock, FaVideo, FaPhone, FaComments,
  FaUserMd, FaHospital, FaStar, FaTimes
} from 'react-icons/fa';

const MyAppointments = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedIds, setReviewedIds] = useState(new Set());

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = user?.role === 'patient'
        ? await appointmentAPI.getPatientAppointments()
        : await appointmentAPI.getAll();
      setAppointments(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentAPI.cancel(id);
        fetchAppointments();
      } catch (error) {
        alert('Failed to cancel appointment');
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await reviewAPI.submit(reviewModal.doctorId, reviewData);
      setReviewedIds(prev => new Set([...prev, reviewModal.appointmentId]));
      setReviewModal(null);
      setReviewData({ rating: 5, comment: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review. You can only review after a completed consultation.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      confirmed: 'bg-green-100 text-green-700 border-green-300',
      accepted: 'bg-green-100 text-green-700 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-300',
      completed: 'bg-blue-100 text-blue-700 border-blue-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getConsultationIcon = (type) => {
    const icons = {
      video: <FaVideo className="text-primary" />,
      audio: <FaPhone className="text-blue-500" />,
      chat: <FaComments className="text-purple-500" />
    };
    return icons[type] || <FaVideo />;
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'accepted') return apt.status === 'accepted' || apt.status === 'confirmed';
    if (filter === 'cancelled') return apt.status === 'cancelled' || apt.status === 'rejected';
    return apt.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <nav className="bg-white shadow-md mb-8">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold text-primary">RuralCare Connect</div>
            <div className="flex items-center gap-6">
              <Link to="/patient/dashboard" className="hover:text-primary">Dashboard</Link>
              <Link to="/patient/doctors" className="hover:text-primary">Doctors</Link>
              <Link to="/patient/appointments" className="text-primary font-semibold">Appointments</Link>
              <Link to="/patient/prescriptions" className="hover:text-primary">Prescriptions</Link>
              <Link to="/patient/reports" className="hover:text-primary">Reports</Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Appointments</h1>
            {user?.role === 'patient' && (
              <Link
                to="/patient/doctors"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Book New Appointment
              </Link>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: appointments.length, active: 'bg-primary' },
                { key: 'pending', label: 'Pending', count: appointments.filter(a => a.status === 'pending').length, active: 'bg-yellow-500' },
                { key: 'accepted', label: 'Confirmed', count: appointments.filter(a => a.status === 'accepted' || a.status === 'confirmed').length, active: 'bg-green-500' },
                { key: 'completed', label: 'Completed', count: appointments.filter(a => a.status === 'completed').length, active: 'bg-blue-500' },
                { key: 'cancelled', label: 'Cancelled', count: appointments.filter(a => a.status === 'cancelled' || a.status === 'rejected').length, active: 'bg-gray-500' },
              ].map(({ key, label, count, active }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === key ? `${active} text-white` : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-md text-center">
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Appointments Found</h3>
              <p className="text-gray-500 mb-6">
                {filter === 'all'
                  ? "You haven't booked any appointments yet"
                  : `No ${filter} appointments`}
              </p>
              {user?.role === 'patient' && (
                <Link
                  to="/patient/book-appointment"
                  className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Book Your First Appointment
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map(apt => (
                <div key={apt._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex-shrink-0">
                            <FaUserMd className="text-2xl text-white" />
                          </div>
                          <div className="flex-1">
                            {user?.role === 'patient' ? (
                              <>
                                <h3 className="text-xl font-bold text-gray-800">
                                  Dr. {apt.doctor?.name || apt.doctorName}
                                </h3>
                                <p className="text-gray-600">
                                  {apt.doctor?.specialization || apt.specialization}
                                </p>
                                {apt.doctor?.hospital && (
                                  <p className="text-sm text-gray-500 flex items-center mt-1">
                                    <FaHospital className="mr-1" /> {apt.doctor.hospital}
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <h3 className="text-xl font-bold text-gray-800">{apt.patient?.name}</h3>
                                <p className="text-gray-600">
                                  Age: {apt.patient?.age} | Gender: {apt.patient?.gender}
                                </p>
                              </>
                            )}

                            <div className="flex flex-wrap gap-4 mt-3">
                              <div className="flex items-center text-gray-700">
                                <FaCalendarAlt className="mr-2 text-primary" />
                                <span className="font-semibold">
                                  {new Date(apt.appointmentDate || apt.date).toLocaleDateString('en-US', {
                                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-700">
                                <FaClock className="mr-2 text-blue-500" />
                                <span className="font-semibold">{apt.appointmentTime || apt.time}</span>
                              </div>
                              <div className="flex items-center text-gray-700">
                                {getConsultationIcon(apt.consultationType)}
                                <span className="ml-2 font-semibold capitalize">{apt.consultationType}</span>
                              </div>
                            </div>

                            {apt.symptoms && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                  <strong>Symptoms:</strong> {apt.symptoms}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(apt.status)}`}>
                          {apt.status.toUpperCase()}
                        </span>

                        <div className="flex gap-2 flex-wrap justify-end">
                          {(apt.status === 'accepted' || apt.status === 'confirmed') && (
                            <Link
                              to={`/consultation/${apt._id}`}
                              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
                            >
                              Join Consultation
                            </Link>
                          )}

                          {apt.status === 'pending' && user?.role === 'patient' && (
                            <button
                              onClick={() => handleCancel(apt._id)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                            >
                              Cancel
                            </button>
                          )}

                          {apt.status === 'completed' && user?.role === 'patient' && (
                            <>
                              <button
                                onClick={() => navigate(`/patient/book-appointment/${apt.doctor?._id || apt.doctorId}`)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                              >
                                Book Follow-up
                              </button>
                              {!reviewedIds.has(apt._id) && (
                                <button
                                  onClick={() => setReviewModal({
                                    doctorId: apt.doctor?._id || apt.doctorId,
                                    doctorName: apt.doctor?.name || apt.doctorName,
                                    appointmentId: apt._id
                                  })}
                                  className="border border-yellow-400 text-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-50 transition-colors text-sm font-semibold flex items-center gap-1"
                                >
                                  <FaStar /> Rate Doctor
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal — outside main div but inside fragment */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Rate Dr. {reviewModal.doctorName}</h2>
              <button
                onClick={() => setReviewModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">Your Rating</p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className={`text-4xl transition-transform hover:scale-110 ${
                        star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <FaStar />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewData.rating]}
                </p>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comment (optional)
                </label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                  value={reviewData.comment}
                  onChange={e => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Share your experience with this doctor..."
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-400"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MyAppointments;
