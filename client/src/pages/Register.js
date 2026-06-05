import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FaStethoscope, FaUser, FaUserMd, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all bg-gray-50 focus:bg-white";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

const Register = () => {
  const [role, setRole] = useState('patient');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    age: '', gender: '', address: '', medicalHistory: '',
    specialization: '', qualification: '', experience: '', hospital: '', consultationFee: ''
  });
  const navigate = useNavigate();

  const set = (field) => (e) => setFormData(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.register({ ...formData, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <FaStethoscope className="text-white text-lg" />
            </div>
            <span className="text-white text-xl font-bold">RuralCare Connect</span>
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            Join India's largest rural healthcare network
          </h1>
          <p className="text-emerald-100 leading-relaxed">
            Get access to 500+ verified doctors, digital prescriptions, and 24/7 healthcare support.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {['Free registration', 'Verified doctors only', 'Secure & private', '24/7 support'].map(item => (
            <div key={item} className="flex items-center gap-3">
              <FaCheckCircle className="text-emerald-300 text-sm flex-shrink-0" />
              <span className="text-emerald-100 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-start justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-xl py-4">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <FaStethoscope className="text-emerald-600 text-2xl" />
            <span className="text-xl font-bold text-gray-800">RuralCare Connect</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
              <p className="text-gray-500 mt-1 text-sm">Fill in your details to get started</p>
            </div>

            {/* Role Toggle */}
            <div className="flex gap-3 mb-7 p-1 bg-gray-100 rounded-xl">
              {[
                { value: 'patient', icon: FaUser, label: 'I am a Patient' },
                { value: 'doctor', icon: FaUserMd, label: 'I am a Doctor' },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
                    ${role === value ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Icon className="text-base" /> {label}
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Common Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelCls}>Full Name <span className="text-red-400">*</span></label>
                  <input type="text" value={formData.name} onChange={set('name')} placeholder="e.g. Priya Sharma" required className={inputCls} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelCls}>Phone Number <span className="text-red-400">*</span></label>
                  <input type="tel" value={formData.phone} onChange={set('phone')} placeholder="+91 98765 43210" required className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Email Address <span className="text-red-400">*</span></label>
                  <input type="email" value={formData.email} onChange={set('email')} placeholder="you@example.com" required className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Password <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={formData.password}
                      onChange={set('password')}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      className={`${inputCls} pr-11`}
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {role === 'patient' ? 'Personal Details' : 'Professional Details'}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Patient Fields */}
              {role === 'patient' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Age</label>
                    <input type="number" value={formData.age} onChange={set('age')} placeholder="25" min="0" max="120" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select value={formData.gender} onChange={set('gender')} className={inputCls}>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Address</label>
                    <input type="text" value={formData.address} onChange={set('address')} placeholder="Village, District, State" className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Medical History <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea value={formData.medicalHistory} onChange={set('medicalHistory')} placeholder="Any existing conditions, allergies, past surgeries..." rows={3} className={`${inputCls} resize-none`} />
                  </div>
                </div>
              )}

              {/* Doctor Fields */}
              {role === 'doctor' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Specialization</label>
                    <input type="text" value={formData.specialization} onChange={set('specialization')} placeholder="e.g. Cardiologist" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Qualification</label>
                    <input type="text" value={formData.qualification} onChange={set('qualification')} placeholder="MBBS, MD" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Experience (years)</label>
                    <input type="number" value={formData.experience} onChange={set('experience')} placeholder="5" min="0" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Consultation Fee (₹)</label>
                    <input type="number" value={formData.consultationFee} onChange={set('consultationFee')} placeholder="500" min="0" className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Hospital / Clinic</label>
                    <input type="text" value={formData.hospital} onChange={set('hospital')} placeholder="Hospital or clinic name" className={inputCls} />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 shadow-sm hover:shadow-md mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : `Create ${role === 'patient' ? 'Patient' : 'Doctor'} Account`}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
