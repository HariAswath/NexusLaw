// src/api/auth.js
import client from './client';

export const login = async (email, password) => {
  // If backend auth isn't ready, use mock:
  // Remove this block once your /auth/login endpoint is live
  if (!import.meta.env.VITE_API_BASE_URL && !email.includes('@real')) {
    const mockUsers = {
      'admin@nexuslaw.com':  { id: 1, name: 'Admin User',  role: 'admin',      email: 'admin@nexuslaw.com' },
      'user@nexuslaw.com':   { id: 2, name: 'Legal Counsel', role: 'legal_user', email: 'user@nexuslaw.com'  },
    };
    const user = mockUsers[email];
    if (user && password === 'password123') {
      return { user, token: 'mock-jwt-token' };
    }
    throw new Error('Invalid credentials');
  }

  const { data } = await client.post('/auth/login', { email, password });
  return data; // expects { user, token }
};

export const logout = () => {
  localStorage.removeItem('nexuslaw_token');
  localStorage.removeItem('nexuslaw_user');
};
