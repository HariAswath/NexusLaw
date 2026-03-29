// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import CaseList   from './pages/CaseList';
import CaseDetail from './pages/CaseDetail';
import CaseForm   from './pages/CaseForm';
import NotFound   from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* App */}
            <Route path="/dashboard"        element={<Dashboard />} />
            <Route path="/cases"            element={<CaseList />} />
            <Route path="/cases/search"     element={<CaseList />} />
            <Route path="/cases/new"        element={<CaseForm />} />
            <Route path="/cases/:id"        element={<CaseDetail />} />
            <Route path="/cases/:id/edit"   element={<CaseForm />} />

            {/* Redirects */}
            <Route path="/"   element={<Navigate to="/dashboard" replace />} />
            <Route path="*"   element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
