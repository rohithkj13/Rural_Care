import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { labAPI } from '../services/api';
import { FaSearch, FaShoppingCart, FaTrash, FaHome, FaFlask, FaCheckCircle, FaTimes } from 'react-icons/fa';

const CATEGORIES = [
  { value: 'all', label: 'All Tests', emoji: '🧪' },
  { value: 'blood', label: 'Blood Tests', emoji: '🩸' },
  { value: 'diabetes', label: 'Diabetes', emoji: '🍬' },
  { value: 'cardiac', label: 'Cardiac', emoji: '❤️' },
  { value: 'thyroid', label: 'Thyroid', emoji: '🦋' },
  { value: 'liver', label: 'Liver', emoji: '🫀' },
  { value: 'kidney', label: 'Kidney', emoji: '🫘' },
  { value: 'urine', label: 'Urine', emoji: '🧫' },
  { value: 'full-body', label: 'Full Body', emoji: '🏥' },
];

const LabTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ collectionType: 'home', collectionAddress: '', scheduledDate: '', scheduledTime: '', notes: '' });

  useEffect(() => { fetchTests(); }, [category, search]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      const res = await labAPI.getTests(params);
      setTests(res.data.data || []);
    } catch { setTests([]); }
    finally { setLoading(false); }
  };

  const addToCart = (test) => {
    if (!cart.find(t => t._id === test._id)) setCart([...cart, test]);
  };

  const removeFromCart = (id) => setCart(cart.filter(t => t._id !== id));

  const total = cart.reduce((sum, t) => sum + (t.discountedPrice || t.price), 0);
  const savings = cart.reduce((sum, t) => sum + (t.price - (t.discountedPrice || t.price)), 0);

  const handleOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await labAPI.createOrder({ testIds: cart.map(t => t._id), ...form });
      setOrderSuccess(true);
      setCart([]);
      setShowCheckout(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally { setSubmitting(false); }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">Our team will contact you to confirm the collection schedule.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setOrderSuccess(false)} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600">Book More Tests</button>
            <Link to="/patient/dashboard" className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/patient/dashboard" className="text-2xl font-bold text-primary">RuralCare Connect</Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link to="/patient/dashboard" className="hover:text-primary">Dashboard</Link>
            <Link to="/patient/doctors" className="hover:text-primary">Doctors</Link>
            <Link to="/patient/lab-tests" className="text-primary border-b-2 border-primary pb-1">Lab Tests</Link>
            <Link to="/patient/health-feed" className="hover:text-primary">Health Feed</Link>
            <button
              onClick={() => cart.length && setShowCheckout(true)}
              className="relative bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <FaShoppingCart /> Cart
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cart.length}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-10">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">🧪 Book Lab Tests</h1>
          <p className="text-lg mb-6 opacity-90">Home sample collection · Trusted labs · Fast reports</p>
          <div className="bg-white rounded-xl p-3 flex gap-3 max-w-xl shadow-lg">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tests..."
                className="w-full pl-10 pr-4 py-2 text-gray-800 focus:outline-none rounded-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button onClick={fetchTests} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold">Search</button>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  category === cat.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Tests Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
              </div>
            ) : tests.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-md">
                <FaFlask className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No tests found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tests.map(test => {
                  const inCart = cart.find(t => t._id === test._id);
                  return (
                    <div key={test._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{test.emoji}</span>
                        {test.isHomeCollection && (
                          <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200 font-semibold">
                            <FaHome className="text-xs" /> Home Collection
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1">{test.name}</h3>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{test.description}</p>
                      <p className="text-xs text-gray-400 mb-3">⏱ Report in {test.reportTime}</p>
                      {test.preparationInstructions && (
                        <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded mb-3">⚠️ {test.preparationInstructions}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          {test.discountedPrice ? (
                            <>
                              <span className="text-xl font-bold text-blue-600">₹{test.discountedPrice}</span>
                              <span className="text-sm text-gray-400 line-through ml-2">₹{test.price}</span>
                              <span className="text-xs text-green-600 ml-1 font-semibold">
                                {Math.round((1 - test.discountedPrice / test.price) * 100)}% off
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-blue-600">₹{test.price}</span>
                          )}
                        </div>
                        <button
                          onClick={() => inCart ? removeFromCart(test._id) : addToCart(test)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            inCart ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {inCart ? 'Remove' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          {cart.length > 0 && (
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-md p-5 sticky top-24">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FaShoppingCart className="text-blue-600" /> Cart ({cart.length})
                </h3>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cart.map(t => (
                    <div key={t._id} className="flex items-center justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{t.name}</p>
                        <p className="text-blue-600 font-semibold">₹{t.discountedPrice || t.price}</p>
                      </div>
                      <button onClick={() => removeFromCart(t._id)} className="text-red-400 hover:text-red-600 ml-2 flex-shrink-0">
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Subtotal</span><span>₹{cart.reduce((s, t) => s + t.price, 0)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-sm text-green-600 mb-1">
                      <span>Savings</span><span>-₹{savings}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>Total</span><span>₹{total}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Proceed to Book
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Book Lab Tests</h2>
              <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 mb-5">
              <p className="text-sm font-semibold text-blue-800 mb-2">Selected Tests ({cart.length})</p>
              {cart.map(t => (
                <div key={t._id} className="flex justify-between text-sm text-blue-700">
                  <span>{t.name}</span><span>₹{t.discountedPrice || t.price}</span>
                </div>
              ))}
              <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-bold text-blue-800">
                <span>Total</span><span>₹{total}</span>
              </div>
            </div>

            <form onSubmit={handleOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Collection Type</label>
                <div className="flex gap-3">
                  {['home', 'lab'].map(type => (
                    <label key={type} className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      form.collectionType === type ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                    }`}>
                      <input type="radio" name="collectionType" value={type} checked={form.collectionType === type}
                        onChange={e => setForm({ ...form, collectionType: e.target.value })} className="hidden" />
                      <span className="font-semibold capitalize">{type === 'home' ? '🏠 Home Collection' : '🏥 Visit Lab'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {form.collectionType === 'home' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Collection Address *</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows="2" required
                    value={form.collectionAddress}
                    onChange={e => setForm({ ...form, collectionAddress: e.target.value })}
                    placeholder="Enter your full address"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Date *</label>
                  <input type="date" required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={form.scheduledDate}
                    onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Time *</label>
                  <select required
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={form.scheduledTime}
                    onChange={e => setForm({ ...form, scheduledTime: e.target.value })}
                  >
                    <option value="">Select time</option>
                    {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (optional)</label>
                <input type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any special instructions"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                💳 Payment of <strong>₹{total}</strong> will be collected at the time of sample collection.
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {submitting ? 'Booking...' : `Confirm Booking · ₹${total}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTests;
