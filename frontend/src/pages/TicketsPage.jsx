import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketApi } from '../api/ticketApi';
import { facilityApi } from '../api/facilityApi';
import { toast } from 'react-toastify';
import { HiOutlineTicket, HiOutlinePlus, HiOutlineFilter, HiOutlineCamera } from 'react-icons/hi';
import './TicketsPage.css';

export default function TicketsPage() {
  const { isAdmin, isTechnician } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, OPEN, IN_PROGRESS, RESOLVED, CLOSED
  const [viewMode, setViewMode] = useState('ALL'); // ALL, MY_TICKETS, ASSIGNED_TO_ME (for tech)
  const [showForm, setShowForm] = useState(false);
  const [initialFormState, setInitialFormState] = useState(null);

  useEffect(() => {
    if (location.state?.autoOpen) {
      setInitialFormState({ facilityId: location.state.resourceId });
      setShowForm(true);
      // Clear state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let res;
      if (viewMode === 'MY_TICKETS' || (!isAdmin && !isTechnician)) {
        res = await ticketApi.getMyTickets();
      } else if (viewMode === 'ASSIGNED_TO_ME') {
        res = await ticketApi.getAssigned();
      } else {
        res = await ticketApi.getAll(filter !== 'ALL' ? { status: filter } : {});
      }
      
      // Client side filter if we didn't use query params
      let data = res.data;
      if (viewMode !== 'ALL' && filter !== 'ALL') {
        data = data.filter(t => t.status === filter);
      }
      
      setTickets(data);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [filter, viewMode, isAdmin, isTechnician]);

  const handleCreate = async (formData) => {
    try {
      await ticketApi.create(formData);
      toast.success('Ticket submitted successfully');
      setShowForm(false);
      setInitialFormState(null);
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'var(--accent-danger)';
      case 'MEDIUM': return 'var(--accent-warning)';
      default: return 'var(--accent-success)';
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Support Tickets</h1>
            <p className="page-subtitle">Report incidents and track maintenance requests</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/tickets/scan')}>
              <HiOutlineCamera /> Scan QR
            </button>
            <button className="btn btn-primary" onClick={() => { setInitialFormState(null); setShowForm(true); }} id="create-ticket-btn">
              <HiOutlinePlus /> New Ticket
            </button>
          </div>
        </div>

        <div className="tickets-toolbar">
          <div className="filter-group">
            <HiOutlineFilter className="filter-icon" />
            <select className="form-select filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          
          {(isAdmin || isTechnician) && (
            <div className="filter-pills">
              <button className={`filter-pill ${viewMode === 'ALL' ? 'active' : ''}`} onClick={() => setViewMode('ALL')}>All Tickets</button>
              <button className={`filter-pill ${viewMode === 'ASSIGNED_TO_ME' ? 'active' : ''}`} onClick={() => setViewMode('ASSIGNED_TO_ME')}>Assigned to Me</button>
              <button className={`filter-pill ${viewMode === 'MY_TICKETS' ? 'active' : ''}`} onClick={() => setViewMode('MY_TICKETS')}>Reported by Me</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-2">
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />)}
          </div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><HiOutlineTicket /></div>
            <div className="empty-state-title">No tickets found</div>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {tickets.map(t => (
              <Link key={t.id} to={`/tickets/${t.id}`} className="ticket-card glass-card">
                <div className="ticket-card-header">
                  <span className="ticket-id">#{t.id.substring(t.id.length - 6).toUpperCase()}</span>
                  <div className="ticket-badges">
                    <span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span>
                    <span className={`badge badge-${t.status.toLowerCase()}`}>{t.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <h3 className="ticket-title">{t.category}: {t.description.length > 60 ? t.description.substring(0, 60) + '...' : t.description}</h3>
                <div className="ticket-meta">
                  <span>🏛️ {t.facilityName}</span>
                  <span>📅 {new Date(t.createdAt).toLocaleDateString()}</span>
                  <span>👤 {t.reporterName}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {showForm && (
          <TicketFormModal 
            onClose={() => { setShowForm(false); setInitialFormState(null); }} 
            onSubmit={handleCreate} 
            initialData={initialFormState}
          />
        )}
      </div>
    </div>
  );
}

function TicketFormModal({ onClose, onSubmit, initialData }) {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    facilityId: initialData?.facilityId || '', 
    category: 'MAINTENANCE', 
    priority: 'LOW',
    description: '', 
    contactPhone: '', 
    contactEmail: ''
  });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    facilityApi.getAll().then(res => setFacilities(res.data));
  }, []);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    setFiles(selected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('ticket', new Blob([JSON.stringify(form)], { type: 'application/json' }));
    files.forEach(f => formData.append('files', f));
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create Support Ticket</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Facility *</label>
            <select className="form-select" name="facilityId" value={form.facilityId} onChange={handleChange} required id="ticket-facility">
              <option value="">Select a facility</option>
              {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" name="category" value={form.category} onChange={handleChange} required id="ticket-category">
                <option value="MAINTENANCE">Maintenance</option>
                <option value="IT_SUPPORT">IT Support</option>
                <option value="CLEANING">Cleaning</option>
                <option value="SECURITY">Security</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority *</label>
              <select className="form-select" name="priority" value={form.priority} onChange={handleChange} required id="ticket-priority">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} required placeholder="Describe the issue in detail..." id="ticket-description" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input type="tel" className="form-input" name="contactPhone" value={form.contactPhone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input type="email" className="form-input" name="contactEmail" value={form.contactEmail} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Attachments (Max 3, Images only)</label>
            <input type="file" className="form-input" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileChange} />
            {files.length > 0 && <p style={{ fontSize: 12, marginTop: 4, color: 'var(--accent-info)' }}>{files.length} file(s) selected</p>}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="ticket-submit">{loading ? 'Submitting...' : 'Submit Ticket'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
