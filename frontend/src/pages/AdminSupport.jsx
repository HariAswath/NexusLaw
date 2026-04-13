// src/pages/AdminSupport.jsx
import { useState, useEffect } from 'react';
import { MdSupportAgent, MdCheckCircle, MdAssignment, MdReply } from 'react-icons/md';
import { useToast } from '../context/ToastContext';
import axios from '../api/client';
import Layout from '../components/Layout';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState({});
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

  const handleUpdate = async (id, status) => {
    try {
      await axios.patch(`/tickets/${id}`, { 
        status, 
        admin_reply: replies[id] || '' 
      });
      success(`Ticket marked as ${status}`);
      fetchTickets();
    } catch (err) {
      error('Update failed');
    }
  };

  const pendingCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <Layout title="Support Desk" subtitle={`Manage and resolve user inquiries (${pendingCount} pending)`}>
      <div className="grid-3 mb-xl">
        <div className="stat-card">
          <div className="stat-card-label">Pending</div>
          <div className="stat-card-value">{pendingCount}</div>
        </div>
        <div className="stat-card" style={{ '--icon-color': 'var(--accent-green)', '--icon-bg': 'rgba(34,197,94,0.1)' }}>
          <div className="stat-card-label">Resolved</div>
          <div className="stat-card-value">{resolvedCount}</div>
        </div>
        <div className="stat-card" style={{ '--icon-color': 'var(--accent-blue)', '--icon-bg': 'rgba(59,130,246,0.1)' }}>
          <div className="stat-card-label">Total Tickets</div>
          <div className="stat-card-value">{tickets.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Category</th>
                <th>User</th>
                <th>Subject & Description</th>
                <th>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.ticket_id}>
                  <td>
                    <span className={`badge badge-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td><span className="text-secondary">{ticket.category}</span></td>
                  <td>
                    <div className="font-semibold">{ticket.user_name}</div>
                    <div className="text-muted text-sm">{new Date(ticket.created_at).toLocaleDateString()}</div>
                  </td>
                  <td style={{ maxWidth: 400 }}>
                    <div className="font-semibold mb-xs">{ticket.subject}</div>
                    <div className="text-secondary text-sm" style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</div>
                  </td>
                  <td>
                    {ticket.status !== 'Resolved' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <textarea 
                          className="form-textarea" 
                          placeholder="Type reply..." 
                          style={{ minHeight: 60, fontSize: 12 }}
                          value={replies[ticket.ticket_id] || ''}
                          onChange={e => setReplies({...replies, [ticket.ticket_id]: e.target.value})}
                        />
                        <div className="flex gap-sm">
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUpdate(ticket.ticket_id, 'Resolved')}
                          >
                            <MdCheckCircle /> Resolve
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleUpdate(ticket.ticket_id, 'In Progress')}
                          >
                            <MdAssignment /> Progress
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm">
                         <div className="font-semibold text-gold mb-xs">Replied by {ticket.admin_name || 'Admin'}:</div>
                         <div className="text-secondary">{ticket.admin_reply}</div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
