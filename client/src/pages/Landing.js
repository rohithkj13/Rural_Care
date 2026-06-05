import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import {
  FaVideo, FaFileMedical, FaCalendarAlt, FaUserMd,
  FaSearch, FaStar, FaCheckCircle, FaPhone, FaEnvelope,
  FaMapMarkerAlt, FaAmbulance, FaPills, FaRobot,
  FaShieldAlt, FaClock, FaHospital, FaArrowRight, FaBriefcase
} from 'react-icons/fa';

const specializations = [
  { name: 'Cardiologist', icon: '❤️', desc: 'Heart Specialists' },
  { name: 'Dermatologist', icon: '🧴', desc: 'Skin Experts' },
  { name: 'Pediatrician', icon: '👶', desc: 'Child Care' },
  { name: 'General Physician', icon: '🩺', desc: 'Primary Care' },
  { name: 'Orthopedic', icon: '🦴', desc: 'Bone & Joint' },
  { name: 'Neurologist', icon: '🧠', desc: 'Brain & Nerves' },
  { name: 'Gynecologist', icon: '👩', desc: "Women's Health" },
  { name: 'Psychiatrist', icon: '🧘', desc: 'Mental Health' },
];

const sampleDoctors = [
  { name: 'Arjun Sharma', spec: 'Cardiologist', exp: 15, fee: 800, rating: 4.8, reviews: 120, initials: 'AS', color: 'from-blue-500 to-blue-700' },
  { name: 'Priya Nair', spec: 'Pediatrician', exp: 10, fee: 600, rating: 4.9, reviews: 150, initials: 'PN', color: 'from-pink-500 to-pink-700' },
  { name: 'Rahul Verma', spec: 'Dermatologist', exp: 8, fee: 500, rating: 4.7, reviews: 90, initials: 'RV', color: 'from-green-500 to-green-700' },
  { name: 'Suresh Iyer', spec: 'General Physician', exp: 20, fee: 400, rating: 4.9, reviews: 200, initials: 'SI', color: 'from-purple-500 to-purple-700' },
];

const Landing = () => {
  const { language, setLanguage, t } = useContext(LanguageContext);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary flex items-center gap-2">
            <FaHospital className="text-primary" />
            RuralCare Connect
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-primary">{t('home')}</Link>
            <Link to="/about" className="hover:text-primary">{t('about')}</Link>
            <Link to="/contact" className="hover:text-primary">{t('contact')}</Link>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
            </select>
            <Link to="/login" className="border-2 border-primary text-primary px-4 py-2 rounded-lg hover:bg-green-50 font-semibold">{t('login')}</Link>
            <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold">{t('register')}</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-blue-50 to-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-green-100 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                🏥 India's #1 Rural Healthcare Platform
              </div>
              <h1 className="text-5xl font-bold text-gray-800 mb-4 leading-tight">
                Your Health,<br />
                <span className="text-primary">Our Priority</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect with top doctors online. Book appointments, consult via video, get digital prescriptions — all from your home.
              </p>

              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-lg p-3 flex gap-3 mb-6">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search doctors, specializations..."
                    className="w-full pl-10 pr-4 py-2 focus:outline-none text-gray-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Link
                  to="/login"
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-600 font-semibold flex items-center gap-2"
                >
                  <FaSearch /> Search
                </Link>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 flex items-center gap-2">
                  Get Started <FaArrowRight />
                </Link>
                <Link to="/login" className="border-2 border-primary text-primary px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-50">
                  Login
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-8">
                <div>
                  <p className="text-3xl font-bold text-primary">500+</p>
                  <p className="text-gray-600 text-sm">Doctors</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">10K+</p>
                  <p className="text-gray-600 text-sm">Patients</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">50K+</p>
                  <p className="text-gray-600 text-sm">Consultations</p>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 text-white">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <FaUserMd className="text-3xl text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Dr. Priya Nair</p>
                      <p className="opacity-80">Pediatrician</p>
                      <div className="flex gap-1 mt-1">
                        {[1,2,3,4,5].map(s => <FaStar key={s} className="text-yellow-300 text-xs" />)}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-4">
                    <p className="font-semibold mb-2">Next Available Slot</p>
                    <p className="text-2xl font-bold">Today, 3:00 PM</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-white bg-opacity-20 rounded-lg p-3 text-center">
                      <FaVideo className="mx-auto mb-1" />
                      <p className="text-xs">Video</p>
                    </div>
                    <div className="flex-1 bg-white bg-opacity-20 rounded-lg p-3 text-center">
                      <FaPhone className="mx-auto mb-1" />
                      <p className="text-xs">Audio</p>
                    </div>
                    <div className="flex-1 bg-white bg-opacity-20 rounded-lg p-3 text-center">
                      <FaFileMedical className="mx-auto mb-1" />
                      <p className="text-xs">Chat</p>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-sm font-semibold">Appointment Confirmed!</span>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2">
                  <FaPills className="text-blue-500" />
                  <span className="text-sm font-semibold">Prescription Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Consult by Specialization</h2>
            <p className="text-gray-600">Find the right specialist for your health needs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specializations.map((spec) => (
              <Link
                to="/login"
                key={spec.name}
                className="bg-white border-2 border-gray-100 rounded-xl p-5 text-center hover:border-primary hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3">{spec.icon}</div>
                <h3 className="font-bold text-gray-800 group-hover:text-primary">{spec.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{spec.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Why Choose RuralCare Connect?</h2>
            <p className="text-gray-600">Everything you need for complete healthcare</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: <FaVideo className="text-4xl text-primary" />, title: 'Video Consultation', desc: 'Connect with doctors via HD video call from anywhere' },
              { icon: <FaRobot className="text-4xl text-purple-500" />, title: 'AI Symptom Checker', desc: 'AI-powered symptom analysis and doctor recommendation' },
              { icon: <FaFileMedical className="text-4xl text-blue-500" />, title: 'Digital Prescriptions', desc: 'Receive and download prescriptions digitally' },
              { icon: <FaAmbulance className="text-4xl text-red-500" />, title: 'Emergency SOS', desc: 'One-click emergency alert with location sharing' },
              { icon: <FaPills className="text-4xl text-orange-500" />, title: 'Medicine Reminders', desc: 'Never miss your medication with smart reminders' },
              { icon: <FaShieldAlt className="text-4xl text-green-500" />, title: 'Secure Records', desc: 'Your medical data is encrypted and secure' },
              { icon: <FaClock className="text-4xl text-yellow-500" />, title: '24/7 Available', desc: 'Doctors available round the clock for consultation' },
              { icon: <FaCalendarAlt className="text-4xl text-indigo-500" />, title: 'Easy Booking', desc: 'Book appointments in just a few clicks' },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Doctors */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Our Top Doctors</h2>
            <p className="text-gray-600">Experienced and verified healthcare professionals</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {sampleDoctors.map((doc, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden">
                <div className={`bg-gradient-to-br ${doc.color} p-6 text-center`}>
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className={`text-2xl font-bold bg-gradient-to-br ${doc.color} bg-clip-text text-transparent`}>{doc.initials}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">Dr. {doc.name}</h3>
                  <p className="text-white opacity-80 text-sm">{doc.spec}</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <FaStar key={s} className={`text-xs ${s <= Math.round(doc.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{doc.reviews} reviews</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <FaBriefcase className="inline mr-1 text-blue-500" />{doc.exp} years experience
                  </p>
                  <p className="text-primary font-bold text-lg mb-3">₹{doc.fee} <span className="text-gray-400 text-sm font-normal">/ consult</span></p>
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">Video</span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">Audio</span>
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200">Chat</span>
                  </div>
                  <Link to="/login" className="block w-full bg-primary text-white py-2 rounded-lg text-center font-semibold hover:bg-green-600 transition-colors">
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/login" className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 inline-flex items-center gap-2">
              View All Doctors <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">How It Works</h2>
            <p className="opacity-80">Get healthcare in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: <FaUserMd className="text-4xl" />, title: 'Register', desc: 'Create your account as a patient or doctor in minutes' },
              { step: '2', icon: <FaCalendarAlt className="text-4xl" />, title: 'Book Appointment', desc: 'Choose your doctor and schedule a convenient time' },
              { step: '3', icon: <FaVideo className="text-4xl" />, title: 'Consult Online', desc: 'Connect via video, audio or chat from anywhere' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="bg-white text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">What Patients Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Ramesh Kumar', location: 'Rural Maharashtra', text: 'RuralCare Connect saved my life! I got a cardiologist consultation from my village without traveling 100km.', rating: 5 },
              { name: 'Priya Sharma', location: 'Rural Rajasthan', text: 'The AI symptom checker helped me understand my condition before seeing the doctor. Amazing feature!', rating: 5 },
              { name: 'Lakshmi Devi', location: 'Rural Tamil Nadu', text: 'I can now consult doctors in Tamil language. The voice assistant is very helpful for people like me.', rating: 5 },
            ].map((review, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <FaStar key={s} className="text-yellow-400 text-sm" />)}
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{review.name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FaMapMarkerAlt className="text-xs" /> {review.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">Join thousands of patients getting quality healthcare from home</p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-primary text-white px-10 py-4 rounded-lg text-lg font-bold hover:bg-green-600 flex items-center gap-2">
              Register as Patient <FaArrowRight />
            </Link>
            <Link to="/register" className="border-2 border-primary text-primary px-10 py-4 rounded-lg text-lg font-bold hover:bg-green-50">
              Join as Doctor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-primary">RuralCare Connect</h3>
              <p className="text-gray-400 text-sm">Healthcare Access for Rural Communities. Connecting patients with doctors across India.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Patients</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/login" className="hover:text-white">Book Appointment</Link></li>
                <li><Link to="/login" className="hover:text-white">Find Doctors</Link></li>
                <li><Link to="/login" className="hover:text-white">Video Consultation</Link></li>
                <li><Link to="/login" className="hover:text-white">Medical Records</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Doctors</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/register" className="hover:text-white">Join as Doctor</Link></li>
                <li><Link to="/login" className="hover:text-white">Manage Appointments</Link></li>
                <li><Link to="/login" className="hover:text-white">Digital Prescriptions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><FaPhone /> +91 1800-123-4567</li>
                <li className="flex items-center gap-2"><FaEnvelope /> support@ruralcare.com</li>
                <li className="flex items-center gap-2"><FaMapMarkerAlt /> India</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
            <p>&copy; 2024 RuralCare Connect. All rights reserved. | Making Healthcare Accessible for All</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
