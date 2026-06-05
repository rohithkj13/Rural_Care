import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { doctorAPI, reviewAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  FaSearch, FaUserMd, FaStar, FaBriefcase, FaHospital,
  FaVideo, FaPhone, FaComments, FaCheckCircle, FaFilter,
  FaTimes, FaCalendarAlt, FaStethoscope, FaEdit, FaTrash,
  FaChevronDown, FaChevronUp
} from 'react-icons/fa';

const AVATAR_COLORS = [
  'from-blue-500 to-blue-700', 'from-emerald-500 to-emerald-700',
  'from-purple-500 to-purple-700', 'from-rose-500 to-rose-700',
  'from-amber-500 to-amber-700', 'from-pink-500 to-pink-700',
  'from-indigo-500 to-indigo-700', 'from-teal-500 to-teal-700',
];

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const Stars = ({ rating, size = 'text-sm' }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <FaStar key={s} className={`${size} ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`} />
    ))}
  </div>
);

const InteractiveStars = ({ rating, onSelect }) => (
  <div className="flex gap-2 justify-center">
    {[1, 2, 3, 4, 5].map(s => (
      <button key={s} type="button" onClick={() => onSelect(s)}
        className={`text-4xl transition-all hover:scale-110 ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>
        <FaStar />
      </button>
    ))}
  </div>
);

// Review Modal — create or edit
const ReviewModal = ({ doctor, existing, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(existing?.rating || 5);
  const [comment, setComment] = useState(existing?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await reviewAPI.submit(doctor._id, { rating, comment });
      onSubmitted(`Review ${existing ? 'updated' : 'submitted'} for Dr. ${doctor.name}`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">{existing ? 'Edit Review' : 'Rate Doctor'}</h2>
            <p className="text-xs text-gray-500">Dr. {doctor.name} · {doctor.specialization}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 mb-3">Your Rating</p>
            <InteractiveStars rating={rating} onSelect={setRating} />
            <p className="text-sm font-semibold text-emerald-600 mt-2">{RATING_LABELS[rating]}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Your Experience <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Share your experience with this doctor..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none bg-gray-50 focus:bg-white" />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors">
              {submitting ? 'Submitting...' : existing ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Inline reviews panel for a doctor card
const DoctorReviews = ({ doctorId, myReview, onEdit, onDelete }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewAPI.getForDoctor(doctorId)
      .then(r => setReviews(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [doctorId]);

  if (loading) return <div className="px-6 py-3 text-xs text-gray-400">Loading reviews...</div>;
  if (reviews.length === 0) return <div className="px-6 py-3 text-xs text-gray-400">No reviews yet. Be the first to review!</div>;

  return (
    <div className="px-6 pb-4 space-y-3 max-h-56 overflow-y-auto">
      {reviews.slice(0, 5).map(r => (
        <div key={r._id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs flex-shrink-0">
            {r.patient?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-gray-800">{r.patient?.name}</p>
              <div className="flex items-center gap-1">
                <Stars rating={r.rating} size="text-xs" />
                {myReview?._id === r._id && (
                  <div className="flex gap-1 ml-1">
                    <button onClick={() => onEdit()} className="text-blue-400 hover:text-blue-600 text-xs"><FaEdit /></button>
                    <button onClick={() => onDelete()} className="text-red-400 hover:text-red-600 text-xs"><FaTrash /></button>
                  </div>
                )}
              </div>
            </div>
            {r.comment && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.comment}</p>}
            <p className="text-xs text-gray-300 mt-0.5">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const DoctorsList = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState(location.state?.filterSpecialization || '');
  const [sortBy, setSortBy] = useState('');
  const [reviewModal, setReviewModal] = useState(null); // { doctor, existing }
  const [myReviews, setMyReviews] = useState({}); // doctorId -> review
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [toast, setToast] = useState('');

  const SPECS = [
    'All', 'Cardiologist', 'Dermatologist', 'Pediatrician',
    'General Physician', 'Orthopedic', 'Neurologist', 'Gynecologist', 'Psychiatrist'
  ];

  useEffect(() => { fetchDoctors(); }, [search, specialization]); // eslint-disable-line
  useEffect(() => { fetchMyReviews(); }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (specialization && specialization !== 'All') params.specialization = specialization;
      const res = await doctorAPI.getAll(params);
      let data = res.data.data || [];
      if (sortBy === 'fee') data = [...data].sort((a, b) => a.consultationFee - b.consultationFee);
      if (sortBy === 'experience') data = [...data].sort((a, b) => b.experience - a.experience);
      if (sortBy === 'rating') data = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setDoctors(data);
    } catch { setDoctors([]); }
    finally { setLoading(false); }
  };

  const fetchMyReviews = async () => {
    try {
      const res = await reviewAPI.getMine();
      const map = {};
      (res.data.data || []).forEach(r => { map[r.doctor?._id || r.doctor] = r; });
      setMyReviews(map);
    } catch {}
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDeleteReview = async (doctorId) => {
    try {
      await reviewAPI.delete(doctorId);
      showToast('Review deleted');
      fetchDoctors();
      fetchMyReviews();
    } catch { showToast('Failed to delete review'); }
  };

  const toggleReviews = (doctorId) => {
    setExpandedReviews(prev => {
      const next = new Set(prev);
      next.has(doctorId) ? next.delete(doctorId) : next.add(doctorId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <FaCheckCircle /> {toast}
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/patient/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <FaStethoscope className="text-white text-xs" />
            </div>
            <span className="font-bold text-gray-900">RuralCare Connect</span>
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600">
            <Link to="/patient/dashboard" className="hover:text-emerald-600">Dashboard</Link>
            <span className="text-emerald-600 font-semibold border-b-2 border-emerald-600 pb-0.5">Doctors</span>
            <Link to="/patient/appointments" className="hover:text-emerald-600">Appointments</Link>
            <Link to="/patient/prescriptions" className="hover:text-emerald-600">Prescriptions</Link>
            <button onClick={logout} className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 text-xs font-semibold">Logout</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-1">Find & Book Doctors</h1>
          <p className="text-emerald-100 mb-6 text-sm">Consult verified doctors via Video, Audio or Chat</p>
          <div className="flex gap-2 bg-white rounded-xl p-1.5 max-w-2xl shadow-lg">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchDoctors()}
                placeholder="Search by name or specialization..."
                className="w-full pl-9 pr-3 py-2.5 text-gray-800 text-sm focus:outline-none rounded-lg" />
            </div>
            <button onClick={fetchDoctors}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Specialization Pills */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto">
          {SPECS.map(s => (
            <button key={s} onClick={() => setSpecialization(s === 'All' ? '' : s)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all
                ${(s === 'All' && !specialization) || specialization === s
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        {/* Sidebar */}
        <div className="hidden md:block w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
              <FaFilter className="text-emerald-500" /> Sort & Filter
            </h3>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sort By</p>
            {[
              { v: '', l: 'Relevance' },
              { v: 'rating', l: 'Highest Rated' },
              { v: 'fee', l: 'Lowest Fee' },
              { v: 'experience', l: 'Most Experienced' },
            ].map(o => (
              <label key={o.v} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="radio" name="sort" value={o.v} checked={sortBy === o.v}
                  onChange={() => { setSortBy(o.v); fetchDoctors(); }}
                  className="accent-emerald-600" />
                <span className="text-sm text-gray-600">{o.l}</span>
              </label>
            ))}
            <button onClick={() => { setSearch(''); setSpecialization(''); setSortBy(''); }}
              className="w-full mt-3 border border-red-300 text-red-500 py-2 rounded-xl text-xs font-semibold hover:bg-red-50">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Doctor Cards */}
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-4">
            <span className="font-bold text-gray-800">{doctors.length}</span> doctors found
          </p>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <FaUserMd className="text-5xl text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No doctors found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {doctors.map((doc, idx) => {
                const myReview = myReviews[doc._id];
                const showReviews = expandedReviews.has(doc._id);
                return (
                  <div key={doc._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <div className="p-6">
                      {/* Top row: Avatar + Info */}
                      <div className="flex gap-4 mb-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0 text-center">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center shadow-md`}>
                            <span className="text-white text-xl font-bold">
                              {doc.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="mt-1">
                            <Stars rating={doc.rating || 0} size="text-xs" />
                            <p className="text-xs text-gray-400">{doc.totalRatings || 0} reviews</p>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-gray-900 truncate">Dr. {doc.name}</h3>
                              <p className="text-emerald-600 font-semibold text-sm">{doc.specialization}</p>
                              <p className="text-gray-500 text-xs truncate">{doc.qualification}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-lg font-bold text-emerald-700">₹{doc.consultationFee}</p>
                              <p className="text-xs text-gray-400">per consult</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1"><FaBriefcase className="text-blue-400" /> {doc.experience} yrs</span>
                            <span className="flex items-center gap-1 truncate max-w-xs"><FaHospital className="text-emerald-400 flex-shrink-0" /> {doc.hospital}</span>
                            <span className="flex items-center gap-1 text-emerald-600 font-semibold"><FaCheckCircle /> Available</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {['Video', 'Audio', 'Chat'].map(t => (
                              <span key={t} className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                {t === 'Video' ? <FaVideo className="text-blue-400" /> : t === 'Audio' ? <FaPhone className="text-green-400" /> : <FaComments className="text-purple-400" />}
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions row — always full width, never squeezed */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => navigate(`/patient/book-appointment/${doc._id}`)}
                          className="flex-1 min-w-[120px] bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <FaCalendarAlt className="text-xs" /> Book Now
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewModal({ doctor: doc, existing: myReview || null })}
                          className={`flex-1 min-w-[120px] py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                            myReview
                              ? 'border border-blue-300 text-blue-600 hover:bg-blue-50'
                              : 'border border-yellow-300 text-yellow-600 hover:bg-yellow-50'
                          }`}
                        >
                          <FaStar className="text-xs" /> {myReview ? 'Edit Review' : 'Rate Doctor'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleReviews(doc._id)}
                          className="flex-1 min-w-[120px] border border-gray-200 text-gray-500 hover:bg-gray-50 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                        >
                          {showReviews ? <><FaChevronUp className="text-xs" /> Hide Reviews</> : <><FaChevronDown className="text-xs" /> View Reviews</>}
                        </button>
                      </div>
                    </div>

                    {/* Reviews Panel */}
                    {showReviews && (
                      <div className="border-t border-gray-100">
                        <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Patient Reviews</p>
                          {myReview && (
                            <button onClick={() => handleDeleteReview(doc._id)}
                              className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                              <FaTrash /> Delete My Review
                            </button>
                          )}
                        </div>
                        <DoctorReviews
                          doctorId={doc._id}
                          myReview={myReview}
                          onEdit={() => setReviewModal({ doctor: doc, existing: myReview })}
                          onDelete={() => handleDeleteReview(doc._id)}
                        />
                      </div>
                    )}

                    {/* Bottom strip */}
                    <div className="bg-gray-50 border-t border-gray-100 px-6 py-2.5 flex items-center justify-between text-xs text-gray-500">
                      <span>Next available: <span className="text-emerald-600 font-semibold">Today</span></span>
                      <span>Avg. wait: <span className="font-semibold text-gray-700">~15 mins</span></span>
                      <span className="text-emerald-600 font-semibold">Free follow-up · 7 days</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          doctor={reviewModal.doctor}
          existing={reviewModal.existing}
          onClose={() => setReviewModal(null)}
          onSubmitted={(msg) => {
            showToast(msg);
            fetchDoctors();
            fetchMyReviews();
          }}
        />
      )}
    </div>
  );
};

export default DoctorsList;
