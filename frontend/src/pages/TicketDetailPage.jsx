import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketApi } from '../api/ticketApi';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';
import { HiOutlineArrowLeft, HiOutlinePaperClip, HiOutlineUser, HiOutlineClock, HiOutlineLocationMarker } from 'react-icons/hi';
import './TicketDetailPage.css';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isTechnician } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [technicians, setTechnicians] = useState([]);
  
  // Modals/Forms state
  const [statusForm, setStatusForm] = useState({ show: false, status: '', notes: '' });
  const [assignForm, setAssignForm] = useState({ show: false, technicianId: '' });

  useEffect(() => {
    fetchTicket();
    if (isAdmin) {
      authApi.getTechnicians().then(res => setTechnicians(res.data));
    }
  }, [id, isAdmin]);

  const fetchTicket = async () => {
    try {
      const res = await ticketApi.getById(id);
      setTicket(res.data);
    } catch (err) {
      toast.error('Failed to load ticket');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await ticketApi.addComment(id, commentText);
      setCommentText('');
      fetchTicket();
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await ticketApi.updateStatus(id, statusForm.status, statusForm.notes);
      toast.success('Status updated');
      setStatusForm({ show: false, status: '', notes: '' });
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await ticketApi.assign(id, assignForm.technicianId);
      toast.success('Ticket assigned');
      setAssignForm({ show: false, technicianId: '' });
      fetchTicket();
    } catch (err) {
      toast.error('Failed to assign ticket');
    }
  };

  if (loading) return <div className="page"><div className="container"><div className="skeleton" style={{ height: 400, borderRadius: 16 }} /></div></div>;
  if (!ticket) return null;

  const canUpdateStatus = isAdmin || (isTechnician && ticket.assignedToId === user.id);

  return (
    <div className="page">
      <div className="container">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tickets')} style={{ marginBottom: 24 }}>
          <HiOutlineArrowLeft /> Back to Tickets
        </button>

        <div className="ticket-detail-grid">
          {/* Main Content */}
          <div className="ticket-main-column">
            <div className="glass-card ticket-header-card">
              <div className="ticket-header-top">
                <span className="ticket-id-large">#{ticket.id.substring(ticket.id.length - 6).toUpperCase()}</span>
                <div className="ticket-badges">
                  <span className={`badge badge-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                  <span className={`badge badge-${ticket.status.toLowerCase()}`}>{ticket.status.replace('_', ' ')}</span>
                </div>
              </div>
              
              <h1 className="ticket-detail-title">{ticket.category}: {ticket.description}</h1>
              
              <div className="ticket-info-bar">
                <span><HiOutlineLocationMarker /> {ticket.facilityName}</span>
                <span><HiOutlineUser /> Reported by {ticket.reporterName}</span>
                <span><HiOutlineClock /> {new Date(ticket.createdAt).toLocaleString()}</span>
              </div>

              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="ticket-attachments">
                  <h3><HiOutlinePaperClip /> Attachments</h3>
                  <div className="attachments-grid">
                    {ticket.attachments.map(att => (
                      <a key={att.id} href={`/api/uploads/${att.filePath}`} target="_blank" rel="noreferrer" className="attachment-item">
                        <img src={`/api/uploads/${att.filePath}`} alt={att.fileName} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="glass-card ticket-comments-card">
              <h3>Discussion</h3>
              
              <div className="comments-list">
                {ticket.comments?.length === 0 ? (
                  <p className="no-comments">No comments yet. Start the discussion below.</p>
                ) : (
                  ticket.comments?.map(c => (
                    <div key={c.id} className={`comment-item ${c.authorId === user.id ? 'my-comment' : ''}`}>
                      <div className="comment-header">
                        <strong>{c.authorName}</strong>
                        <span>{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="comment-bubble">
                        {c.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="comment-form">
                <textarea 
                  className="form-textarea" 
                  placeholder="Type your message here..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="comment-form-actions">
                  <button type="submit" className="btn btn-primary" disabled={!commentText.trim()} id="ticket-comment-btn">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="ticket-sidebar">
            <div className="glass-card sidebar-card">
              <h3>Ticket Status</h3>
              <p className="status-current">Currently: <strong>{ticket.status.replace('_', ' ')}</strong></p>
              
              {canUpdateStatus && ticket.status !== 'CLOSED' && (
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ width: '100%', marginTop: 12 }}
                  onClick={() => setStatusForm({ show: true, status: ticket.status, notes: '' })}
                >
                  Update Status
                </button>
              )}

              {ticket.resolutionNotes && (
                <div className="resolution-notes">
                  <h4>Resolution Notes:</h4>
                  <p>{ticket.resolutionNotes}</p>
                </div>
              )}
            </div>

            <div className="glass-card sidebar-card">
              <h3>Assignment</h3>
              {ticket.assignedToId ? (
                <div className="assignment-info">
                  <div className="assignee-avatar"><HiOutlineUser /></div>
                  <div>
                    <p className="assignee-name">{ticket.assignedToName}</p>
                    <p className="assignee-role">Technician</p>
                  </div>
                </div>
              ) : (
                <p className="unassigned-text">Unassigned</p>
              )}

              {isAdmin && ticket.status !== 'CLOSED' && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ width: '100%', marginTop: 12 }}
                  onClick={() => setAssignForm({ show: true, technicianId: ticket.assignedToId || '' })}
                >
                  {ticket.assignedToId ? 'Reassign' : 'Assign Technician'}
                </button>
              )}
              {isTechnician && !ticket.assignedToId && ticket.status === 'OPEN' && (
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ width: '100%', marginTop: 12 }}
                  onClick={() => ticketApi.assign(id, user.id).then(() => { toast.success('Assigned to you'); fetchTicket(); })}
                >
                  Assign to Me
                </button>
              )}
            </div>

            <div className="glass-card sidebar-card">
              <h3>Contact Info</h3>
              <div className="contact-info">
                <p><strong>Name:</strong> {ticket.reporterName}</p>
                <p><strong>Email:</strong> <a href={`mailto:${ticket.contactEmail}`}>{ticket.contactEmail}</a></p>
                {ticket.contactPhone && <p><strong>Phone:</strong> <a href={`tel:${ticket.contactPhone}`}>{ticket.contactPhone}</a></p>}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {statusForm.show && (
          <div className="modal-overlay" onClick={() => setStatusForm({ ...statusForm, show: false })}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Update Status</h2>
                <button className="modal-close" onClick={() => setStatusForm({ ...statusForm, show: false })}>✕</button>
              </div>
              <form onSubmit={handleUpdateStatus}>
                <div className="form-group">
                  <label className="form-label">New Status</label>
                  <select className="form-select" value={statusForm.status} onChange={e => setStatusForm({...statusForm, status: e.target.value})}>
                    <option value="OPEN" disabled={ticket.status !== 'OPEN'}>Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED" disabled={ticket.status !== 'RESOLVED' && !isAdmin}>Closed</option>
                  </select>
                </div>
                {(statusForm.status === 'RESOLVED' || statusForm.status === 'CLOSED') && (
                  <div className="form-group">
                    <label className="form-label">Resolution Notes</label>
                    <textarea className="form-textarea" value={statusForm.notes} onChange={e => setStatusForm({...statusForm, notes: e.target.value})} required />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setStatusForm({ ...statusForm, show: false })}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Update</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {assignForm.show && (
          <div className="modal-overlay" onClick={() => setAssignForm({ ...assignForm, show: false })}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Assign Technician</h2>
                <button className="modal-close" onClick={() => setAssignForm({ ...assignForm, show: false })}>✕</button>
              </div>
              <form onSubmit={handleAssign}>
                <div className="form-group">
                  <label className="form-label">Select Technician</label>
                  <select className="form-select" value={assignForm.technicianId} onChange={e => setAssignForm({...assignForm, technicianId: e.target.value})} required>
                    <option value="">-- Select --</option>
                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setAssignForm({ ...assignForm, show: false })}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Assign</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
