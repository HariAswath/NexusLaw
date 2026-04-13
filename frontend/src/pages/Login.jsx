// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdBalance, MdEmail, MdLock, MdLogin } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const { error: showError }  = useToast();
  const navigate              = useNavigate();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      showError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@nexuslaw.com', password: 'password123' });
    else setForm({ email: 'user@nexuslaw.com', password: 'password123' });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <MdBalance style={{ color: '#000', fontSize: 30 }} />
          </div>
          <h1 className="login-title">NexusLaw</h1>
          <p className="login-subtitle">Legal Case Intelligence Platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <MdEmail style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', fontSize: 17, pointerEvents: 'none'
              }} />
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="you@nexuslaw.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <MdLock style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', fontSize: 17, pointerEvents: 'none'
              }} />
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: 8, justifyContent: 'center', padding: '12px' }}
            disabled={loading}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in…</>
            ) : (
              <><MdLogin style={{ fontSize: 17 }} /> Sign In</>
            )}
          </button>
        </form>

        {/* Demo Accounts */}
        <div style={{ marginTop: 'var(--space-xl)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-lg)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 14 }}>
            Quick Access Demo Accounts
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary w-full"
              style={{ justifyContent: 'space-between', padding: '10px 14px', fontSize: 13 }}
              onClick={() => fillDemo('admin')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="badge badge-admin" style={{ fontSize: 9, padding: '2px 8px' }}>Admin</span>
                <span style={{ color: 'var(--text-secondary)' }}>admin@nexuslaw.com</span>
              </div>
              <MdLogin style={{ fontSize: 14, opacity: 0.5 }} />
            </button>
            <button
              type="button"
              className="btn btn-secondary w-full"
              style={{ justifyContent: 'space-between', padding: '10px 14px', fontSize: 13 }}
              onClick={() => fillDemo('user')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="badge badge-user" style={{ fontSize: 9, padding: '2px 8px' }}>User</span>
                <span style={{ color: 'var(--text-secondary)' }}>user@nexuslaw.com</span>
              </div>
              <MdLogin style={{ fontSize: 14, opacity: 0.5 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
