// src/components/Layout.jsx
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Layout({ children, title, subtitle }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-wrapper" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <span>Loading NexusLaw...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div>
            <div className="topbar-title">{title}</div>
          </div>
          {subtitle && <span className="topbar-subtitle">{subtitle}</span>}
        </header>

        {/* Page Content */}
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}
