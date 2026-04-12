// src/api/client.js  — Base Axios instance
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach JWT on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexuslaw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handling
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexuslaw_token');
      localStorage.removeItem('nexuslaw_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;
