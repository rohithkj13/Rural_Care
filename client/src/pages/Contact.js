import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">RuralCare Connect</Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/about" className="hover:text-primary">About</Link>
            <Link to="/contact" className="text-primary font-semibold">Contact</Link>
            <Link to="/login" className="bg-primary text-white px-4 py-2 rounded hover:bg-green-600">Login</Link>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <FaPhone className="text-primary text-2xl mr-4" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-gray-600">+91 1800-123-4567</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-primary text-2xl mr-4" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-gray-600">support@ruralcare.com</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-primary text-2xl mr-4" />
                <div>
                  <p className="font-semibold">Address</p>
                  <p className="text-gray-600">123 Healthcare Street, Medical City, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Send Message</h2>
            <form className="space-y-4">
              <input type="text" placeholder="Your Name" className="w-full border rounded px-4 py-2" />
              <input type="email" placeholder="Your Email" className="w-full border rounded px-4 py-2" />
              <textarea placeholder="Your Message" rows="4" className="w-full border rounded px-4 py-2"></textarea>
              <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-green-600">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
