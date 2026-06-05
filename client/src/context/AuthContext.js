import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

/**
 * AuthProvider — manages authentication state globally.
 *
 * Key fix: logout() only redirects to /login if the user was already
 * authenticated. On first load of a public page (like Landing), if there
 * is no token, we simply set loading=false and stay on the current page.
 * The global 401 interceptor only triggers a redirect when a logged-in
 * user's session expires mid-session, not on initial public page visits.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Track whether the user was authenticated so we only redirect on session expiry
  const wasAuthenticated = useRef(false);

  const logout = useCallback((redirect = true) => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    wasAuthenticated.current = false;
    if (redirect) {
      window.location.href = '/login';
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me');
      setUser(res.data.data);
      wasAuthenticated.current = true;
    } catch {
      // Token invalid or expired — clear it but don't redirect (we're on initial load)
      logout(false);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }

    /**
     * Global 401 interceptor — only redirects to /login if the user
     * was already authenticated (i.e. their session expired mid-use).
     * Does NOT redirect on public pages where no token exists.
     */
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && wasAuthenticated.current) {
          logout(true);
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [fetchUser, logout]);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    wasAuthenticated.current = true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout: () => logout(true), loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
