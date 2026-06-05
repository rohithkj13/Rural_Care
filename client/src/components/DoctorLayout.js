import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  FaTachometerAlt, FaCalendarAlt, FaUsers, FaFileMedical,
  FaUserMd, FaBell, FaBars, FaTimes, FaSignOutAlt, FaStethoscope
} from 'react-icons/fa';

const navItems = [
  { path: '/doctor/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
  { path: '/doctor/appointments', icon: FaCalendarAlt, label: 'Appointments' },
  { path: '/doctor/patients', icon: FaUsers, label: 'Patients' },
  { path: '/doctor/prescriptions', icon: FaFileMedical, label: 'Prescriptions' },
  { path: '/doctor/profile', icon: FaUserMd, label: 'Profile' },
];

const DoctorLayout = ({ children, notifications = 0 }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-emerald-800 to-emerald-900 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-emerald-700">
          <div className="flex items-center gap-2">
            <FaStethoscope className="text-emerald-300 text-xl" />
            <span className="text-white font-bold text-lg">RuralCare</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-emerald-300 hover:text-white">
            <FaTimes />
          </button>
        </div>

        {/* Doctor Info */}
        <div className="px-6 py-5 border-b border-emerald-700">
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl font-bold mb-2">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <p className="text-white font-semibold text-sm truncate">Dr. {user?.name}</p>
          <p className="text-emerald-300 text-xs truncate">{user?.specialization || 'General Physician'}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${location.pathname === path
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-emerald-200 hover:bg-emerald-700 hover:text-white'}`}
            >
              <Icon className="text-base flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-emerald-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-emerald-200 hover:bg-red-600 hover:text-white transition-all"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-emerald-600">
            <FaBars className="text-xl" />
          </button>
          <div className="hidden lg:block">
            <h2 className="text-gray-500 text-sm">
              {navItems.find(n => n.path === location.pathname)?.label || 'Doctor Portal'}
            </h2>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Link to="/doctor/notifications" className="relative text-gray-500 hover:text-emerald-600">
              <FaBell className="text-xl" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">Dr. {user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
