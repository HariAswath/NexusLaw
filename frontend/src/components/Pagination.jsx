// src/components/Pagination.jsx
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const left  = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);

  for (let i = left; i <= right; i++) pages.push(i);

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >‹</button>

      {left > 1 && (
        <>
          <button className="page-btn" onClick={() => onChange(1)}>1</button>
          {left > 2 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`page-btn${p === page ? ' active' : ''}`}
          onClick={() => onChange(p)}
        >{p}</button>
      ))}

      {right < totalPages && (
        <>
          {right < totalPages - 1 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>}
          <button className="page-btn" onClick={() => onChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button
        className="page-btn"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >›</button>
    </div>
  );
}
