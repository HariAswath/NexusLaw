// src/pages/CaseDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MdArrowBack, MdEdit, MdDelete, MdLink,
  MdPerson, MdGavel, MdTag, MdHistory, MdEventNote
} from 'react-icons/md';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import PrecedentCard from '../components/PrecedentCard';
import { getCaseById, getPrecedents, deleteCase, getCaseLogs } from '../api/cases';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CaseDetail() {
  const { id }                  = useParams();
  const navigate                = useNavigate();
  const { isAdmin }             = useAuth();
  const { success, error: err } = useToast();

  const [caseData, setCaseData]     = useState(null);
  const [precedents, setPrecedents] = useState([]);
  const [logs, setLogs]             = useState([]);
  const [loadingCase, setLoadingCase] = useState(true);
  const [loadingPrec, setLoadingPrec] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => {
    setLoadingCase(true);
    setLoadingPrec(true);
    setLoadingLogs(true);
    getCaseById(id)
      .then(setCaseData)
      .catch(() => err('Failed to load case'))
      .finally(() => setLoadingCase(false));
    getPrecedents(id)
      .then(setPrecedents)
      .catch(() => {})
      .finally(() => setLoadingPrec(false));
    getCaseLogs(id)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoadingLogs(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete case "${caseData?.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteCase(id);
      success('Case deleted successfully');
      navigate('/cases');
    } catch {
      err('Failed to delete case');
    } finally {
      setDeleting(false);
    }
  };

  if (loadingCase) {
    return (
      <Layout title="Case Detail">
        <div className="spinner-wrapper"><div className="spinner" /><span>Loading case…</span></div>
      </Layout>
    );
  }

  if (!caseData) {
    return (
      <Layout title="Not Found">
        <div className="empty-state">
          <div className="empty-state-icon">⚖️</div>
          <div className="empty-state-title">Case not found</div>
          <button className="btn btn-secondary mt-md" onClick={() => navigate('/cases')}>← Back to Cases</button>
        </div>
      </Layout>
    );
  }

  const c = caseData;

  return (
    <Layout title="Case Detail" subtitle={c.case_number}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left" style={{ flex: 1 }}>
          <div className="flex items-center gap-sm mb-sm">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/cases')}>
              <MdArrowBack /> Back
            </button>
            <StatusBadge status={c.status} />
            <span className="badge badge-type">{c.case_type}</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            {c.title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {c.case_number} · Filed {c.date_filed} · {c.court}
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-sm" style={{ flexShrink: 0 }}>
            <button className="btn btn-secondary" onClick={() => navigate(`/cases/${id}/edit`)}>
              <MdEdit /> Edit
            </button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              <MdDelete /> {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-lg)', alignItems: 'start' }}>
        {/* LEFT: Main Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

          {/* Case Info */}
          <div className="card">
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Case Information
            </h2>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Case Number</div><div className="detail-value" style={{ fontFamily: 'monospace', color: 'var(--gold)' }}>{c.case_number}</div></div>
              <div className="detail-item"><div className="detail-label">Case Type</div><div className="detail-value">{c.case_type}</div></div>
              <div className="detail-item"><div className="detail-label">Court</div><div className="detail-value">{c.court}</div></div>
              <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value"><StatusBadge status={c.status} /></div></div>
              <div className="detail-item"><div className="detail-label">Date Filed</div><div className="detail-value">{c.date_filed}</div></div>
            </div>

            {c.description && (
              <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
                <div className="detail-label" style={{ marginBottom: 8 }}>Description</div>
                <p style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.7 }}>{c.description}</p>
              </div>
            )}
          </div>

          {/* Parties */}
          {c.parties?.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MdPerson /> Parties Involved
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {c.parties.map((p) => (
                  <div key={p.party_id} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '12px 16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Represented by {p.lawyer}</div>
                    </div>
                    <span className={`badge ${p.party_type === 'Plaintiff' ? 'badge-open' : 'badge-closed'}`}>{p.party_type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Witnesses */}
          {c.witnesses?.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MdPerson /> Witnesses
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {c.witnesses.map((w) => (
                  <div key={w.witness_id} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '12px 16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{w.name}</div>
                    {w.statement && <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 6, fontStyle: 'italic' }}>"{w.statement}"</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Judgement */}
          {c.judgement && (
            <div className="card">
              <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MdGavel /> Judgement
              </h2>
              <div className="detail-grid">
                <div className="detail-item"><div className="detail-label">Judge</div><div className="detail-value">{c.judgement.judge}</div></div>
                <div className="detail-item"><div className="detail-label">Judgement Date</div><div className="detail-value">{c.judgement.date}</div></div>
              </div>
              <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--gold)' }}>
                <p style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.7 }}>{c.judgement.summary}</p>
              </div>
            </div>
          )}

          {/* History / Audit Trail */}
          <div className="card">
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MdHistory /> Case History & Audit Trail
            </h2>
            {loadingLogs ? (
               <div className="spinner-wrapper" style={{ padding: 'var(--space-lg)' }}><div className="spinner" /></div>
            ) : logs.length === 0 ? (
               <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No history recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: 20 }}>
                {/* Vertical Line */}
                <div style={{ position: 'absolute', left: 4, top: 10, bottom: 10, width: 2, background: 'var(--border)' }} />
                
                {logs.map((log, idx) => (
                  <div key={log.log_id} style={{ position: 'relative', paddingBottom: idx === logs.length - 1 ? 0 : 20 }}>
                    {/* Circle */}
                    <div style={{ position: 'absolute', left: -20, top: 4, width: 10, height: 10, borderRadius: '50%', background: log.event_type === 'Creation' ? 'var(--gold)' : 'var(--accent-blue)', border: '2px solid var(--bg-card)', zIndex: 1 }} />
                    
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.event_type === 'Creation' ? 'Case Created' : 'Status Changed'}
                      <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>· {new Date(log.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      {log.event_type === 'StatusChange' ? (
                        <>Changed from <strong style={{color: 'var(--text-muted)'}}>{log.old_value}</strong> to <strong>{log.new_value}</strong></>
                      ) : (
                        <>Initialized with status <strong>{log.new_value}</strong></>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MdPerson size={14} /> {log.user_name || 'System Auto'} · <MdEventNote size={14} /> {log.notes}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Keywords + Precedents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Keywords */}
          {c.keywords?.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MdTag /> Keywords
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {c.keywords.map((k) => (
                  <span key={k} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.3)' }}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Precedents */}
          <div className="card">
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MdLink /> Linked Precedents
            </h2>
            {loadingPrec ? (
              <div className="spinner-wrapper" style={{ padding: 'var(--space-lg)' }}>
                <div className="spinner" /><span>Finding precedents…</span>
              </div>
            ) : precedents.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                <div className="empty-state-icon" style={{ fontSize: 32 }}>🔗</div>
                <div className="empty-state-title">No precedents found</div>
                <p className="text-sm text-muted">No similar cases have been linked yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  {precedents.length} case{precedents.length !== 1 ? 's' : ''} ranked by relevance
                </p>
                {[...precedents]
                  .sort((a, b) => (b.relevance_score ?? 0) - (a.relevance_score ?? 0))
                  .map((p) => <PrecedentCard key={p.case_id} precedent={p} />)
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
