// src/pages/CaseForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdSave, MdArrowBack } from 'react-icons/md';
import Layout from '../components/Layout';
import { createCase, updateCase, getCaseById } from '../api/cases';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navigate } from 'react-router-dom';

const CASE_TYPES = ['Criminal', 'Civil', 'Constitutional', 'Family', 'Tax', 'Intellectual Property', 'Labour'];
const COURTS     = ['Supreme Court', 'High Court', 'Sessions Court', 'District Court', 'Labour Court'];
const STATUSES   = ['Open', 'Pending', 'Closed', 'Appealed'];

const EMPTY = {
  title: '', case_number: '', case_type: '', court: '',
  status: 'Open', date_filed: '', description: '', keywords: '',
};

export default function CaseForm() {
  const { id }                      = useParams(); // present when editing
  const isEdit                      = Boolean(id);
  const navigate                    = useNavigate();
  const { isAdmin }                 = useAuth();
  const { success, error: showErr } = useToast();

  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});

  // Guard — only admins can access this page
  if (!isAdmin) return <Navigate to="/cases" replace />;

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getCaseById(id)
      .then((c) => {
        setForm({
          title: c.title ?? '',
          case_number: c.case_number ?? '',
          case_type: c.case_type ?? '',
          court: c.court ?? '',
          status: c.status ?? 'Open',
          date_filed: c.date_filed ?? '',
          description: c.description ?? '',
          keywords: (c.keywords ?? []).join(', '),
        });
      })
      .catch(() => showErr('Failed to load case data'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.case_number.trim()) e.case_number = 'Case number is required';
    if (!form.case_type)          e.case_type   = 'Case type is required';
    if (!form.court)              e.court       = 'Court is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      };
      if (isEdit) {
        await updateCase(id, payload);
        success('Case updated successfully!');
        navigate(`/cases/${id}`);
      } else {
        const created = await createCase(payload);
        success('Case created successfully!');
        navigate(`/cases/${created.case_id}`);
      }
    } catch {
      showErr(`Failed to ${isEdit ? 'update' : 'create'} case`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title={isEdit ? 'Edit Case' : 'Add New Case'} subtitle={isEdit ? `Editing case #${id}` : 'Create a new legal case'}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="flex items-center gap-sm mb-xl">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <MdArrowBack /> Back
          </button>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>
            {isEdit ? 'Edit Case' : 'New Case'}
          </h1>
        </div>

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /><span>Loading case…</span></div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="card">
              <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
                Basic Information
              </h2>

              <div className="grid-2" style={{ gap: 'var(--space-md)' }}>
                {/* Title */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="title">Case Title *</label>
                  <input id="title" name="title" className={`form-input ${errors.title ? 'input-error' : ''}`} value={form.title} onChange={handleChange} placeholder="e.g. State v. John Doe" />
                  {errors.title && <span style={{ fontSize: 12, color: 'var(--accent-red)' }}>{errors.title}</span>}
                </div>

                {/* Case Number */}
                <div className="form-group">
                  <label className="form-label" htmlFor="case_number">Case Number *</label>
                  <input id="case_number" name="case_number" className={`form-input ${errors.case_number ? 'input-error' : ''}`} value={form.case_number} onChange={handleChange} placeholder="e.g. CIV-2024-001" />
                  {errors.case_number && <span style={{ fontSize: 12, color: 'var(--accent-red)' }}>{errors.case_number}</span>}
                </div>

                {/* Date Filed */}
                <div className="form-group">
                  <label className="form-label" htmlFor="date_filed">Date Filed</label>
                  <input id="date_filed" name="date_filed" type="date" className="form-input" value={form.date_filed} onChange={handleChange} />
                </div>

                {/* Case Type */}
                <div className="form-group">
                  <label className="form-label" htmlFor="case_type">Case Type *</label>
                  <select id="case_type" name="case_type" className={`form-select ${errors.case_type ? 'input-error' : ''}`} value={form.case_type} onChange={handleChange}>
                    <option value="">Select type…</option>
                    {CASE_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  {errors.case_type && <span style={{ fontSize: 12, color: 'var(--accent-red)' }}>{errors.case_type}</span>}
                </div>

                {/* Court */}
                <div className="form-group">
                  <label className="form-label" htmlFor="court">Court *</label>
                  <select id="court" name="court" className={`form-select ${errors.court ? 'input-error' : ''}`} value={form.court} onChange={handleChange}>
                    <option value="">Select court…</option>
                    {COURTS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  {errors.court && <span style={{ fontSize: 12, color: 'var(--accent-red)' }}>{errors.court}</span>}
                </div>

                {/* Status */}
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select id="status" name="status" className="form-select" value={form.status} onChange={handleChange}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="form-group mt-md">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea id="description" name="description" className="form-textarea" value={form.description} onChange={handleChange} placeholder="Brief case description…" rows={4} />
              </div>

              {/* Keywords */}
              <div className="form-group mt-md">
                <label className="form-label" htmlFor="keywords">Keywords</label>
                <input id="keywords" name="keywords" className="form-input" value={form.keywords} onChange={handleChange} placeholder="Comma-separated: murder, intent, witness" />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>These are used for precedent matching and search</span>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-sm mt-lg" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving
                  ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</>
                  : <><MdSave /> {isEdit ? 'Save Changes' : 'Create Case'}</>
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
