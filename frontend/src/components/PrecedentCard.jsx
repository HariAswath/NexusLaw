// src/components/PrecedentCard.jsx
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function PrecedentCard({ precedent }) {
  const navigate = useNavigate();
  const score = precedent.relevance_score ?? 0;

  const scoreColor =
    score >= 80 ? 'var(--accent-green)' :
    score >= 60 ? 'var(--gold)' :
                  'var(--accent-red)';

  return (
    <div
      className="precedent-card"
      onClick={() => navigate(`/cases/${precedent.case_id}`)}
    >
      <div className="flex items-center justify-between mb-sm">
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.8px' }}>
          {precedent.case_number}
        </span>
        <StatusBadge status={precedent.status} />
      </div>

      <div className="precedent-card-title">{precedent.title}</div>
      <div className="precedent-card-meta">{precedent.court} · {precedent.case_type}</div>

      {/* Relevance score bar */}
      <div style={{ marginTop: '10px' }}>
        <div className="flex items-center justify-between mb-sm" style={{ marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)' }}>
            Relevance Score
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: scoreColor }}>
            {score}%
          </span>
        </div>
        <div className="relevance-bar">
          <div
            className="relevance-bar-fill"
            style={{ width: `${score}%`, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}cc)` }}
          />
        </div>
      </div>

      {/* Match tags */}
      {precedent.match_reasons?.length > 0 && (
        <div className="precedent-tags">
          {precedent.match_reasons.map((r) => (
            <span key={r} className="precedent-tag">{r.replace('_', ' ')}</span>
          ))}
        </div>
      )}
    </div>
  );
}
