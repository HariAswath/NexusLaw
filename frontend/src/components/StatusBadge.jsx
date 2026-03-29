// src/components/StatusBadge.jsx
export default function StatusBadge({ status }) {
  const map = {
    Open:     'badge-open',
    Closed:   'badge-closed',
    Pending:  'badge-pending',
    Appealed: 'badge-appealed',
  };
  return (
    <span className={`badge ${map[status] ?? 'badge-type'}`}>
      {status}
    </span>
  );
}
