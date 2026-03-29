// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { MdBalance } from 'react-icons/md';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(ellipse at center, rgba(212,175,55,0.07) 0%, transparent 70%)',
    }}>
      <MdBalance style={{ fontSize: 64, color: 'var(--gold)', opacity: 0.5, marginBottom: 'var(--space-lg)' }} />
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 80, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>404</h1>
      <p style={{ fontSize: 20, color: 'var(--text-secondary)', margin: '16px 0 32px' }}>Page not found</p>
      <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
    </div>
  );
}
