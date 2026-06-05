import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { appointmentAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Appointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentAPI.getAll();
      setAppointments(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentAPI.cancel(id);
        fetchAppointments();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold mb-6">My Appointments</h1>

        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600 mb-4">No appointments found</p>
              {user?.role === 'patient' && (
                <Link to="/patient/doctors" className="bg-primary text-white px-6 py-2 rounded hover:bg-green-600">Book Appointment</Link>
              )}
            </div>
          ) : (
            appointments.map(apt => (
              <div key={apt._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {user?.role === 'patient' ? (
                      <>
                        <h3 className="text-xl font-bold">Dr. {apt.doctor?.name}</h3>
                        <p className="text-gray-600">{apt.doctor?.specialization}</p>
                        <p className="text-gray-600">{apt.doctor?.hospital}</p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold">{apt.patient?.name}</h3>
                        <p className="text-gray-600">Age: {apt.patient?.age} | Gender: {apt.patient?.gender}</p>
                      </>
                    )}
                    <p className="text-gray-600 mt-2">Date: {new Date(apt.date).toLocaleDateString()}</p>
                    <p className="text-gray-600">Time: {apt.time}</p>
                    <p className="text-gray-600">Type: {apt.consultationType}</p>
                    {apt.symptoms && <p className="text-gray-600 mt-2"><strong>Symptoms:</strong> {apt.symptoms}</p>}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`px-4 py-1 rounded text-sm font-semibold ${
                      apt.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      apt.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{apt.status}</span>
                    {apt.status === 'accepted' && (
                      <Link to={`/consultation/${apt._id}`} className="bg-primary text-white px-4 py-2 rounded hover:bg-green-600">Join Consultation</Link>
                    )}
                    {apt.status === 'pending' && user?.role === 'patient' && (
                      <button onClick={() => handleCancel(apt._id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
