// src/pages/Support.jsx
import { useState, useEffect } from 'react';
import { MdHelp, MdSend, MdHistory, MdMessage } from 'react-icons/md';
import { useToast } from '../context/ToastContext';
import axios from '../api/client';
import Layout from '../components/Layout';

const CATEGORIES = ['Technical Issue', 'Case Filing Help', 'Billing', 'General Inquiry'];

export default function Support() {
  const [form, setForm] = useState({ category: CATEGORIES[0], subject: '', description: '' });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const fetchTickets = async () => {
    try {
      const res = await axios.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      error('Failed to load tickets');
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/tickets', form);
      success('Ticket submitted successfully!');
      setForm({ category: CATEGORIES[0], subject: '', description: '' });
      fetchTickets();
    } catch (err) {
      error('Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Help & Support" subtitle="Raise a query or check your ticket status">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--space-xl)' }}>
        {/* New Ticket Form */}
        <div className="card">
          <h2 className="mb-md flex items-center gap-sm" style={{ fontSize: 18 }}>
            <MdHelp className="text-gold" /> Raise New Query
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input 
                className="form-input" 
                placeholder="Brief summary of your query" 
                value={form.subject}
                onChange={e => setForm({...form, subject: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="form-textarea" 
                placeholder="Detailed explanation..." 
                rows={5}
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                required
              />
            </div>
            <button className="btn btn-primary w-full" disabled={loading}>
              <MdSend /> {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </div>

        {/* Ticket History */}
        <div className="card">
          <h2 className="mb-md flex items-center gap-sm" style={{ fontSize: 18 }}>
            <MdHistory className="text-gold" /> Your Inquiries
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {tickets.length === 0 ? (
              <div className="empty-state">
                <MdMessage className="empty-state-icon" />
                <p>No tickets raised yet.</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.ticket_id} className="precedent-card">
                  <div className="flex justify-between items-start mb-sm">
                    <div>
                      <span className={`badge badge-${ticket.status.toLowerCase().replace(' ', '-')}`} style={{ marginBottom: 4 }}>
                        {ticket.status}
                      </span>
                      <h3 className="precedent-card-title">{ticket.subject}</h3>
                    </div>
                    <span className="text-muted" style={{ fontSize: 11 }}>
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-secondary text-sm mb-md">{ticket.description}</p>
                  
                  {ticket.admin_reply && (
                    <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--gold)' }}>
                      <p className="font-semibold text-gold mb-xs" style={{ fontSize: 12 }}>Admin Response:</p>
                      <p className="text-sm">{ticket.admin_reply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
