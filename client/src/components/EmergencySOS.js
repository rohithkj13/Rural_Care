import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaPhoneAlt, FaTimes, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';

const EmergencySOS = () => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState(null);
  const [emergencyContacted, setEmergencyContacted] = useState(false);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleEmergency = () => {
    setShowModal(true);
    getLocation();
  };

  const confirmEmergency = async () => {
    setEmergencyContacted(true);

    // In production, this would:
    // 1. Send SMS to emergency contacts
    // 2. Alert nearest doctors
    // 3. Send location to ambulance service
    // 4. Create emergency appointment

    const emergencyData = {
      userId: user?.id,
      userName: user?.name,
      userPhone: user?.phone,
      location: location,
      timestamp: new Date().toISOString(),
      medicalHistory: user?.medicalHistory || 'Not available'
    };

    console.log('Emergency SOS Activated:', emergencyData);

    // Simulate API call
    setTimeout(() => {
      alert('Emergency services have been notified!\n\nNearest doctor will contact you shortly.\n\nEmergency hotline: 108');
    }, 1000);
  };

  return (
    <>
      {/* Floating Emergency Button */}
      <button
        onClick={handleEmergency}
        className="fixed bottom-6 left-6 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl animate-pulse"
        title="Emergency SOS"
      >
        <FaPhoneAlt className="text-2xl" />
      </button>

      {/* Emergency Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="text-2xl" />
            </button>

            {!emergencyContacted ? (
              <>
                <div className="text-center mb-6">
                  <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <FaExclamationTriangle className="text-4xl text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-red-600 mb-2">EMERGENCY SOS</h2>
                  <p className="text-gray-600">Are you facing a medical emergency?</p>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <p className="text-red-700 font-semibold mb-2">This will:</p>
                  <ul className="text-sm text-red-600 space-y-1">
                    <li>✓ Alert nearest available doctors</li>
                    <li>✓ Send your location to emergency services</li>
                    <li>✓ Notify your emergency contacts</li>
                    <li>✓ Share your medical history</li>
                  </ul>
                </div>

                {user && (
                  <div className="bg-gray-50 rounded p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-2"><strong>Your Information:</strong></p>
                    <p className="text-sm">Name: {user.name}</p>
                    <p className="text-sm">Phone: {user.phone}</p>
                    {location && (
                      <p className="text-sm flex items-center mt-2">
                        <FaMapMarkerAlt className="mr-1 text-red-500" />
                        Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmEmergency}
                    className="bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 animate-pulse"
                  >
                    CONFIRM EMERGENCY
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    For immediate help, call: <strong className="text-red-600">108</strong>
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <FaPhoneAlt className="text-4xl text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">Help is on the way!</h2>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 text-left">
                  <p className="text-green-700 mb-2">✓ Emergency services notified</p>
                  <p className="text-green-700 mb-2">✓ Nearest doctor alerted</p>
                  <p className="text-green-700 mb-2">✓ Location shared</p>
                  <p className="text-green-700">✓ Emergency contacts informed</p>
                </div>
                <p className="text-gray-600 mb-4">A doctor will contact you shortly</p>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                  <p className="text-yellow-700 text-sm">
                    <strong>Emergency Hotline:</strong> 108<br />
                    <strong>Ambulance:</strong> 102
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEmergencyContacted(false);
                  }}
                  className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-green-600"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencySOS;
