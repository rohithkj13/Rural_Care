import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { appointmentAPI } from '../services/api';
import {
  FaLock, FaCheckCircle, FaArrowLeft, FaStethoscope,
  FaCreditCard, FaMobileAlt, FaUniversity, FaWallet,
  FaShieldAlt, FaSpinner
} from 'react-icons/fa';
import { SiGooglepay, SiPhonepe, SiPaytm } from 'react-icons/si';

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'];
const WALLETS = [
  { name: 'Paytm', icon: SiPaytm, color: 'text-blue-600' },
  { name: 'PhonePe', icon: SiPhonepe, color: 'text-purple-600' },
  { name: 'Google Pay', icon: SiGooglepay, color: 'text-blue-500' },
  { name: 'Amazon Pay', icon: FaWallet, color: 'text-orange-500' },
];

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [bank, setBank] = useState(BANKS[0]);
  const [wallet, setWallet] = useState('Paytm');
  const [step, setStep] = useState('pay'); // pay | processing | success
  const [error, setError] = useState('');

  useEffect(() => {
    if (!state?.appointmentData || !state?.doctor) {
      navigate('/patient/book-appointment');
    }
  }, [state, navigate]);

  if (!state?.appointmentData || !state?.doctor) return null;

  const { appointmentData, doctor } = state;
  const fee = doctor.consultationFee || 0;
  const gst = Math.round(fee * 0.18);
  const total = fee + gst;

  const formatCard = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) => {
    const v = val.replace(/\D/g, '').slice(0, 4);
    return v.length >= 3 ? v.slice(0, 2) + '/' + v.slice(2) : v;
  };

  const validate = () => {
    if (method === 'upi') {
      if (!upiId.includes('@')) return 'Enter a valid UPI ID (e.g. name@upi)';
    }
    if (method === 'card') {
      if (card.number.replace(/\s/g, '').length < 16) return 'Enter a valid 16-digit card number';
      if (!card.name.trim()) return 'Enter cardholder name';
      if (card.expiry.length < 5) return 'Enter valid expiry (MM/YY)';
      if (card.cvv.length < 3) return 'Enter valid CVV';
    }
    return '';
  };

  const handlePay = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setStep('processing');

    try {
      // Simulate payment gateway delay
      await new Promise(r => setTimeout(r, 2000));
      // Book the appointment after payment
      await appointmentAPI.create({
        ...appointmentData,
        paymentStatus: 'paid',
        paymentMethod: method,
        amountPaid: total
      });
      setStep('success');
    } catch (e) {
      setStep('pay');
      setError(e.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  if (step === 'processing') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-sm w-full mx-4">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaSpinner className="text-4xl text-emerald-500 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h2>
        <p className="text-gray-500 text-sm">Please wait, do not close this window...</p>
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">Amount: <span className="font-bold text-gray-900">₹{total}</span></p>
        </div>
      </div>
    </div>
  );

  if (step === 'success') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <FaCheckCircle className="text-5xl text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful!</h2>
        <p className="text-gray-500 text-sm mb-6">Your appointment has been booked successfully.</p>

        <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3 mb-6">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Doctor</span><span className="font-semibold">Dr. {doctor.name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-semibold">{new Date(appointmentData.appointmentDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Time</span><span className="font-semibold">{appointmentData.appointmentTime}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Type</span><span className="font-semibold capitalize">{appointmentData.consultationType}</span></div>
          <div className="border-t border-gray-200 pt-3 flex justify-between text-sm"><span className="text-gray-500">Amount Paid</span><span className="font-bold text-emerald-600 text-base">₹{total}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Payment Method</span><span className="font-semibold uppercase">{method}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">PAID</span></div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate('/patient/appointments')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-bold transition">
            My Appointments
          </button>
          <button onClick={() => navigate('/patient/dashboard')} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/patient/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <FaStethoscope className="text-white text-xs" />
            </div>
            <span className="font-bold text-gray-900">RuralCare Connect</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
            <FaLock className="text-xs" /> Secure Payment
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 mb-6">
          <FaArrowLeft className="text-xs" /> Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Payment</h1>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Payment Methods */}
          <div className="md:col-span-2 space-y-4">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
            )}

            {/* Method Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                {[
                  { id: 'upi', label: 'UPI', icon: FaMobileAlt },
                  { id: 'card', label: 'Card', icon: FaCreditCard },
                  { id: 'netbanking', label: 'Net Banking', icon: FaUniversity },
                  { id: 'wallet', label: 'Wallet', icon: FaWallet },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => { setMethod(id); setError(''); }}
                    className={`flex-1 flex flex-col items-center gap-1 py-4 text-xs font-bold transition border-b-2 ${
                      method === id ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="text-lg" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* UPI */}
                {method === 'upi' && (
                  <div className="space-y-5">
                    <div className="flex gap-3 flex-wrap">
                      {[
                        { name: 'Google Pay', icon: SiGooglepay, color: 'text-blue-500' },
                        { name: 'PhonePe', icon: SiPhonepe, color: 'text-purple-600' },
                        { name: 'Paytm', icon: SiPaytm, color: 'text-blue-600' },
                      ].map(({ name, icon: Icon, color }) => (
                        <button
                          key={name}
                          onClick={() => setUpiId(`${name.toLowerCase().replace(' ', '')}@upi`)}
                          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:border-emerald-400 hover:bg-emerald-50 transition"
                        >
                          <Icon className={`text-xl ${color}`} /> {name}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Or enter UPI ID</label>
                      <input
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                      />
                    </div>
                  </div>
                )}

                {/* Card */}
                {method === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Card Number</label>
                      <input
                        value={card.number}
                        onChange={e => setCard(c => ({ ...c, number: formatCard(e.target.value) }))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50 font-mono tracking-widest"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                      <input
                        value={card.name}
                        onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                        placeholder="Name as on card"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expiry</label>
                        <input
                          value={card.expiry}
                          onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">CVV</label>
                        <input
                          value={card.cvv}
                          onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                          placeholder="•••"
                          type="password"
                          maxLength={4}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking */}
                {method === 'netbanking' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Your Bank</label>
                    <div className="grid grid-cols-2 gap-3">
                      {BANKS.map(b => (
                        <button
                          key={b}
                          onClick={() => setBank(b)}
                          className={`px-4 py-3 rounded-xl border text-sm font-semibold text-left transition ${
                            bank === b ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-700 hover:border-emerald-300'
                          }`}
                        >
                          <FaUniversity className="inline mr-2 text-gray-400" />{b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wallet */}
                {method === 'wallet' && (
                  <div className="grid grid-cols-2 gap-3">
                    {WALLETS.map(({ name, icon: Icon, color }) => (
                      <button
                        key={name}
                        onClick={() => setWallet(name)}
                        className={`flex items-center gap-3 px-4 py-4 rounded-xl border text-sm font-semibold transition ${
                          wallet === name ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-700 hover:border-emerald-300'
                        }`}
                      >
                        <Icon className={`text-2xl ${color}`} /> {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-3 text-xs text-gray-400 bg-white border border-gray-100 rounded-xl px-4 py-3">
              <FaShieldAlt className="text-emerald-500 text-base flex-shrink-0" />
              <span>Your payment is secured with 256-bit SSL encryption. We never store your card details.</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Order Summary</h3>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {doctor.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Dr. {doctor.name}</p>
                  <p className="text-xs text-emerald-600">{doctor.specialization}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>{new Date(appointmentData.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  <span>{appointmentData.appointmentTime}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="capitalize">{appointmentData.consultationType} Consultation</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Consultation Fee</span>
                  <span>₹{fee}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{gst}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-emerald-600">₹{total}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePay}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-sm transition shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
            >
              <FaLock className="text-xs" /> Pay ₹{total}
            </button>

            <p className="text-center text-xs text-gray-400">
              By paying you agree to our <span className="underline cursor-pointer">Terms of Service</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
