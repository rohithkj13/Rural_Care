import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import PrivateRoute from './components/PrivateRoute';
import VoiceNavigation from './components/VoiceNavigation';
import EmergencySOS from './components/EmergencySOS';

import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import PatientProfile from './pages/PatientProfile';
import PatientComplaints from './pages/PatientComplaints';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorPatients from './pages/DoctorPatients';
import DoctorPrescriptions from './pages/DoctorPrescriptions';
import DoctorProfile from './pages/DoctorProfile';
import DoctorNotifications from './pages/DoctorNotifications';
import AdminDashboard from './pages/AdminDashboard';
import AdminDoctors from './pages/AdminDoctors';
import AdminPatients from './pages/AdminPatients';
import AdminPrescriptions from './pages/AdminPrescriptions';
import AdminSymptomLogs from './pages/AdminSymptomLogs';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminComplaints from './pages/AdminComplaints';
import DoctorsList from './pages/DoctorsList';
import BookAppointment from './pages/BookAppointment';
import QuickBookAppointment from './pages/QuickBookAppointment';
import MyAppointments from './pages/MyAppointments';
import Consultation from './pages/Consultation';
import Prescriptions from './pages/Prescriptions';
import MedicalReports from './pages/MedicalReports';
import Notifications from './pages/Notifications';
import SymptomChecker from './pages/SymptomChecker';
import VoiceSymptomChecker from './pages/VoiceSymptomChecker';
import MedicineReminders from './pages/MedicineReminders';
import LabTests from './pages/LabTests';
import HealthFeed from './pages/HealthFeed';
import FitnessTracker from './pages/FitnessTracker';
import DoctorFitnessView from './pages/DoctorFitnessView';
import PatientBloodDashboard from './pages/PatientBloodDashboard';
import DonorDashboard from './pages/DonorDashboard';
import AdminBloodDonors from './pages/AdminBloodDonors';
import AdminProfile from './pages/AdminProfile';
import Payment from './pages/Payment';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <VoiceNavigation />
          <EmergencySOS />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/patient/dashboard" element={<PrivateRoute role="patient"><PatientDashboard /></PrivateRoute>} />
            <Route path="/patient/symptom-checker" element={<PrivateRoute role="patient"><SymptomChecker /></PrivateRoute>} />
            <Route path="/patient/voice-symptom-checker" element={<PrivateRoute role="patient"><VoiceSymptomChecker /></PrivateRoute>} />
            <Route path="/patient/doctors" element={<PrivateRoute role="patient"><DoctorsList /></PrivateRoute>} />
            <Route path="/patient/book-appointment" element={<PrivateRoute role="patient"><QuickBookAppointment /></PrivateRoute>} />
            <Route path="/patient/book-appointment/:doctorId" element={<PrivateRoute role="patient"><BookAppointment /></PrivateRoute>} />
            <Route path="/patient/appointments" element={<PrivateRoute role="patient"><MyAppointments /></PrivateRoute>} />
            <Route path="/patient/prescriptions" element={<PrivateRoute role="patient"><Prescriptions /></PrivateRoute>} />
            <Route path="/patient/reports" element={<PrivateRoute role="patient"><MedicalReports /></PrivateRoute>} />
            <Route path="/patient/reminders" element={<PrivateRoute role="patient"><MedicineReminders /></PrivateRoute>} />
            <Route path="/patient/medicine-reminders" element={<PrivateRoute role="patient"><MedicineReminders /></PrivateRoute>} />
            <Route path="/patient/lab-tests" element={<PrivateRoute role="patient"><LabTests /></PrivateRoute>} />
            <Route path="/patient/health-feed" element={<PrivateRoute role="patient"><HealthFeed /></PrivateRoute>} />
            <Route path="/patient/fitness" element={<PrivateRoute role="patient"><FitnessTracker /></PrivateRoute>} />
            <Route path="/patient/blood-donors" element={<PrivateRoute role="patient"><PatientBloodDashboard /></PrivateRoute>} />
            <Route path="/patient/payment" element={<PrivateRoute role="patient"><Payment /></PrivateRoute>} />
            <Route path="/patient/notifications" element={<PrivateRoute role="patient"><Notifications /></PrivateRoute>} />
            <Route path="/patient/profile" element={<PrivateRoute role="patient"><PatientProfile /></PrivateRoute>} />
            <Route path="/patient/support" element={<PrivateRoute role="patient"><PatientComplaints /></PrivateRoute>} />
            
            <Route path="/doctor/dashboard" element={<PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>} />
            <Route path="/doctor/appointments" element={<PrivateRoute role="doctor"><DoctorAppointments /></PrivateRoute>} />
            <Route path="/doctor/patients" element={<PrivateRoute role="doctor"><DoctorPatients /></PrivateRoute>} />
            <Route path="/doctor/prescriptions" element={<PrivateRoute role="doctor"><DoctorPrescriptions /></PrivateRoute>} />
            <Route path="/doctor/profile" element={<PrivateRoute role="doctor"><DoctorProfile /></PrivateRoute>} />
            <Route path="/doctor/notifications" element={<PrivateRoute role="doctor"><DoctorNotifications /></PrivateRoute>} />
            <Route path="/doctor/fitness" element={<PrivateRoute role="doctor"><DoctorFitnessView /></PrivateRoute>} />
            
            <Route path="/donor/dashboard" element={<PrivateRoute><DonorDashboard /></PrivateRoute>} />

            <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/doctors" element={<PrivateRoute role="admin"><AdminDoctors /></PrivateRoute>} />
            <Route path="/admin/patients" element={<PrivateRoute role="admin"><AdminPatients /></PrivateRoute>} />
            <Route path="/admin/prescriptions" element={<PrivateRoute role="admin"><AdminPrescriptions /></PrivateRoute>} />
            <Route path="/admin/symptom-logs" element={<PrivateRoute role="admin"><AdminSymptomLogs /></PrivateRoute>} />
            <Route path="/admin/analytics" element={<PrivateRoute role="admin"><AdminAnalytics /></PrivateRoute>} />
            <Route path="/admin/complaints" element={<PrivateRoute role="admin"><AdminComplaints /></PrivateRoute>} />
            <Route path="/admin/blood-donors" element={<PrivateRoute role="admin"><AdminBloodDonors /></PrivateRoute>} />
            <Route path="/admin/profile" element={<PrivateRoute role="admin"><AdminProfile /></PrivateRoute>} />
            
            <Route path="/consultation/:appointmentId" element={<PrivateRoute><Consultation /></PrivateRoute>} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
