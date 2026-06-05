import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * PrivateRoute — protects pages from unauthenticated access.
 *
 * - Shows a loading screen while the auth state is being resolved (token validation).
 * - Redirects to /login if no user is authenticated.
 * - If a required `role` prop is passed and the user's role doesn't match,
 *   they are redirected to their own dashboard instead of seeing a blank page.
 */
const dashboardByRole = {
  admin: '/admin/dashboard',
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard'
};

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  const userRole = String(user?.role || '').toLowerCase();
  const requiredRole = String(role || '').toLowerCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== requiredRole) {
    return <Navigate to={dashboardByRole[userRole] || '/login'} replace />;
  }

  return children;
};

export default PrivateRoute;
