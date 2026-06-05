import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  FaTachometerAlt, FaUserMd, FaUsers, FaFileMedical, FaRobot,
  FaChartBar, FaExclamationCircle, FaBars, FaTimes, FaSignOutAlt,
  FaShieldAlt, FaTint, FaUserCircle
} from 'react-icons/fa';

const navItems = [
  { path: '/admin/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
  { path: '/admin/doctors', icon: FaUserMd, label: 'Doctors' },
  { path: '/admin/patients', icon: FaUsers, label: 'Patients' },
  { path: '/admin/prescriptions', icon: FaFileMedical, label: 'Prescriptions' },
  { path: '/admin/symptom-logs', icon: FaRobot, label: 'AI Symptom Logs' },
  { path: '/admin/analytics', icon: FaChartBar, label: 'Analytics' },
  { path: '/admin/complaints', icon: FaExclamationCircle, label: 'Complaints' },
  { path: '/admin/blood-donors', icon: FaTint, label: 'Blood Donors' },
  { path: '/admin/profile', icon: FaUserCircle, label: 'Profile' },
];

const AdminLayout = ({ children, badge = {} }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-indigo-400 text-xl" />
            <div>
              <p className="text-white font-bold text-base leading-tight">RuralCare</p>
              <p className="text-indigo-300 text-xs">Admin Portal</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        {/* Admin Info */}
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-indigo-300 text-xs">Administrator</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                ${location.pathname === path
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              <span className="flex items-center gap-3">
                <Icon className="text-base flex-shrink-0" />
                {label}
              </span>
              {badge[path] > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {badge[path]}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600 hover:text-white transition-all"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setOpen(true)} className="lg:hidden text-gray-600 hover:text-indigo-600">
            <FaBars className="text-xl" />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm text-gray-500 font-medium">
              {navItems.find(n => n.path === location.pathname)?.label || 'Admin Panel'}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
