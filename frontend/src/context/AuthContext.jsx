// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nexuslaw_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (_) { /* ignore */ }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { user: u, token } = await apiLogin(email, password);
    localStorage.setItem('nexuslaw_token', token);
    localStorage.setItem('nexuslaw_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
