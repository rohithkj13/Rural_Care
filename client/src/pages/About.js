import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">RuralCare Connect</Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/about" className="text-primary font-semibold">About</Link>
            <Link to="/contact" className="hover:text-primary">Contact</Link>
            <Link to="/login" className="bg-primary text-white px-4 py-2 rounded hover:bg-green-600">Login</Link>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6">About RuralCare Connect</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-lg text-gray-700 mb-4">
            RuralCare Connect is a comprehensive telemedicine platform designed to bridge the healthcare gap in rural areas. 
            We connect patients with qualified doctors through video, audio, and chat consultations.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            Our mission is to make quality healthcare accessible to everyone, regardless of their location.
          </p>
          <h2 className="text-2xl font-bold mt-6 mb-4">Our Services</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Online Video Consultations</li>
            <li>Digital Prescriptions</li>
            <li>Medical Report Management</li>
            <li>Appointment Booking System</li>
            <li>24/7 Healthcare Support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
