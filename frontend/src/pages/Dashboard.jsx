// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  MdGavel, MdCheckCircle, MdPending, MdError, MdTrendingUp
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { getCaseStats } from '../api/cases';
import { useAuth } from '../context/AuthContext';

const PIE_COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#0ea5e9'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px' }}>
      <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>{payload[0].name}</p>
      <p style={{ color: 'var(--gold)', fontSize: 13 }}>{payload[0].value} cases</p>
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const { user }              = useAuth();
  const navigate              = useNavigate();

  useEffect(() => {
    getCaseStats().then(setStats).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Cases',   value: stats.total,   icon: <MdGavel />,        iconBg: 'rgba(212,175,55,0.15)',  iconColor: 'var(--gold)',         accentColor: 'var(--gold)' },
    { label: 'Open Cases',    value: stats.open,    icon: <MdTrendingUp />,   iconBg: 'rgba(34,197,94,0.12)',   iconColor: 'var(--accent-green)', accentColor: 'var(--accent-green)' },
    { label: 'Closed Cases',  value: stats.closed,  icon: <MdCheckCircle />,  iconBg: 'rgba(59,130,246,0.12)',  iconColor: 'var(--accent-blue)',  accentColor: 'var(--accent-blue)' },
    { label: 'Pending Review',value: stats.pending, icon: <MdPending />,      iconBg: 'rgba(245,158,11,0.12)',  iconColor: 'var(--accent-amber)', accentColor: 'var(--accent-amber)' },
  ] : [];

  const pieData = stats?.byType?.map((d) => ({ name: d.name, value: d.value })) ?? [];

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${user?.name}`}>
      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /><span>Loading dashboard…</span></div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid-4 mb-xl">
            {statCards.map((s) => (
              <div key={s.label} className="stat-card" style={{ '--accent-color': s.accentColor, '--icon-bg': s.iconBg, '--icon-color': s.iconColor }}>
                <div className="stat-card-icon">{s.icon}</div>
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid-2 mb-xl">
            {/* Bar Chart — Cases by Type */}
            <div className="card">
              <div className="flex items-center justify-between mb-md">
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Cases by Type</h2>
                <span className="badge badge-type">Bar Chart</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.byType} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212,175,55,0.05)' }} />
                  <Bar dataKey="value" name="Cases" radius={[4,4,0,0]} fill="url(#goldGrad)" />
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4af37" />
                      <stop offset="100%" stopColor="#d4af3780" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart — Cases by Status */}
            <div className="card">
              <div className="flex items-center justify-between mb-md">
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Cases by Status</h2>
                <span className="badge badge-type">Pie Chart</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Open',     value: stats.open },
                      { name: 'Closed',   value: stats.closed },
                      { name: 'Pending',  value: stats.pending },
                      { name: 'Appealed', value: stats.appealed },
                    ]}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                    paddingAngle={3} dataKey="value"
                  >
                    {['Open','Closed','Pending','Appealed'].map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Cases Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-md">
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Cases</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/cases')}>View All →</button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Case Number</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Court</th>
                    <th>Status</th>
                    <th>Filed</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentCases?.map((c) => (
                    <tr key={c.case_id} onClick={() => navigate(`/cases/${c.case_id}`)}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--gold)', fontSize: 12.5 }}>{c.case_number}</td>
                      <td style={{ fontWeight: 600 }}>{c.title}</td>
                      <td><span className="badge badge-type">{c.case_type}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{c.court}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{c.date_filed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
