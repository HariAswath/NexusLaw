// src/pages/CaseList.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdFilterAlt, MdClear, MdAdd } from 'react-icons/md';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { getCases } from '../api/cases';
import { useAuth } from '../context/AuthContext';

const CASE_TYPES = ['Criminal', 'Civil', 'Constitutional', 'Family', 'Tax', 'Intellectual Property', 'Labour'];
const COURTS     = ['Supreme Court', 'High Court', 'Sessions Court', 'District Court', 'Labour Court'];
const STATUSES   = ['Open', 'Closed', 'Pending', 'Appealed'];

const PAGE_SIZE = 6;

export default function CaseList() {
  const [cases, setCases]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', case_type: '', court: '', status: '', keywords: '' });
  const [applied, setApplied] = useState({});
  const [page, setPage]       = useState(1);
  const [sortKey, setSortKey] = useState('date_filed');
  const [sortDir, setSortDir] = useState('desc');
  const { isAdmin }           = useAuth();
  const navigate              = useNavigate();

  const fetchCases = useCallback(async (f = {}) => {
    setLoading(true);
    try {
      const data = await getCases(f);
      setCases(data);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  const handleSearch = () => {
    const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    setApplied(active);
    fetchCases(active);
  };

  const handleClear = () => {
    setFilters({ search: '', case_type: '', court: '', status: '', keywords: '' });
    setApplied({});
    fetchCases({});
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...cases].sort((a, b) => {
    const av = a[sortKey] ?? '';
    const bv = b[sortKey] ?? '';
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const paginated    = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages   = Math.ceil(sorted.length / PAGE_SIZE);
  const activeCount  = Object.keys(applied).length;

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span style={{ opacity: 0.3 }}>⇅</span>;
    return <span>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <Layout title="Case Repository" subtitle={`${cases.length} cases found`}>
      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="form-group" style={{ maxWidth: 200 }}>
          <label className="form-label"><MdFilterAlt style={{ verticalAlign: 'middle' }} /> Case Type</label>
          <select
            className="form-select"
            value={filters.case_type}
            onChange={(e) => setFilters((f) => ({ ...f, case_type: e.target.value }))}
          >
            <option value="">All Types</option>
            {CASE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ maxWidth: 200 }}>
          <label className="form-label">Court</label>
          <select
            className="form-select"
            value={filters.court}
            onChange={(e) => setFilters((f) => ({ ...f, court: e.target.value }))}
          >
            <option value="">All Courts</option>
            {COURTS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Search Case / Person</label>
          <input
            className="form-input"
            placeholder="Search by title, party or witness..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className="form-group" style={{ maxWidth: 160 }}>
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Keywords (comma separated)</label>
          <input
            className="form-input"
            placeholder="e.g. murder, contract, appeal"
            value={filters.keywords}
            onChange={(e) => setFilters((f) => ({ ...f, keywords: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', paddingBottom: 1 }}>
          <button className="btn btn-primary" onClick={handleSearch}>
            <MdSearch /> Search
          </button>
          {activeCount > 0 && (
            <button className="btn btn-secondary" onClick={handleClear}>
              <MdClear /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Active filters */}
      {activeCount > 0 && (
        <div className="flex gap-sm mb-md" style={{ flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Active filters:</span>
          {Object.entries(applied).map(([k, v]) => (
            <span key={k} className="badge badge-type">{k.replace('_', ' ')}: {v}</span>
          ))}
        </div>
      )}

      {/* Table Card */}
      <div className="card" style={{ padding: 0 }}>
        <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            All Cases <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({cases.length})</span>
          </h2>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/cases/new')}>
              <MdAdd /> Add Case
            </button>
          )}
        </div>

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /><span>Loading cases…</span></div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚖️</div>
            <div className="empty-state-title">No cases found</div>
            <p style={{ fontSize: 13 }}>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('case_number')}>
                      Case No. <SortIcon col="case_number" />
                    </th>
                    <th className="sortable" onClick={() => handleSort('title')}>
                      Title <SortIcon col="title" />
                    </th>
                    <th>Type</th>
                    <th className="sortable" onClick={() => handleSort('court')}>
                      Court <SortIcon col="court" />
                    </th>
                    <th>Status</th>
                    <th className="sortable" onClick={() => handleSort('date_filed')}>
                      Filed <SortIcon col="date_filed" />
                    </th>
                    <th>Keywords</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => (
                    <tr key={c.case_id} onClick={() => navigate(`/cases/${c.case_id}`)}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--gold)', fontSize: 12.5, fontWeight: 600 }}>
                        {c.case_number}
                      </td>
                      <td style={{ fontWeight: 600, maxWidth: 240 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.title}
                        </div>
                      </td>
                      <td><span className="badge badge-type">{c.case_type}</span></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{c.court}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{c.date_filed}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {c.keywords?.slice(0, 2).map((k) => (
                            <span key={k} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.2)' }}>{k}</span>
                          ))}
                          {c.keywords?.length > 2 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{c.keywords.length - 2}</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
