import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../api/bookingApi';
import { toast } from 'react-toastify';
import { HiOutlineCalendar, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import './BookingsPage.css';

export default function BookingsPage() {
  const { isAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [remarksModal, setRemarksModal] = useState(null); // { id, action }
  const [remarks, setRemarks] = useState('');

  const fetchBookings = async () => {
    try {
      const res = isAdmin ? await bookingApi.getAll(filter ? { status: filter } : {}) : await bookingApi.getMyBookings();
      setBookings(res.data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [isAdmin, filter]);

  const handleAction = async () => {
    try {
      if (remarksModal.action === 'approve') {
        await bookingApi.approve(remarksModal.id, remarks);
        toast.success('Booking approved');
      } else {
        await bookingApi.reject(remarksModal.id, remarks);
        toast.success('Booking rejected');
      }
      setRemarksModal(null);
      setRemarks('');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingApi.cancel(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const filteredBookings = filter && !isAdmin
    ? bookings.filter(b => b.status === filter)
    : bookings;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">{isAdmin ? 'Manage Bookings' : 'My Bookings'}</h1>
          <p className="page-subtitle">{isAdmin ? 'Review, approve, or reject booking requests' : 'Track your facility booking requests'}</p>
        </div>

        <div className="filter-pills" style={{ marginBottom: 24 }}>
          {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
            <button key={s} className={`filter-pill ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><HiOutlineCalendar /></div>
            <div className="empty-state-title">No bookings found</div>
            <p>Create a booking from the Facilities page</p>
          </div>
        ) : (
          <div className="booking-list">
            {filteredBookings.map(b => (
              <div key={b.id} className="booking-item glass-card">
                <div className="booking-main">
                  <div className="booking-info">
                    <h3>{b.facilityName}</h3>
                    <p className="booking-detail">
                      📅 {b.bookingDate} · ⏰ {b.startTime} - {b.endTime}
                    </p>
                    <p className="booking-purpose">{b.purpose}</p>
                    {isAdmin && <p className="booking-user">👤 {b.userName} ({b.userEmail})</p>}
                    {b.adminRemarks && <p className="booking-remarks">💬 Admin: {b.adminRemarks}</p>}
                  </div>
                  <div className="booking-side">
                    <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                    {b.status === 'APPROVED' && (
                      <div className="booking-qr" style={{ marginTop: 12, textAlign: 'center' }}>
                        <div style={{ background: 'white', padding: '8px', borderRadius: '8px', display: 'inline-block' }}>
                          <img 
                            src={`http://localhost:8080/api/bookings/${b.id}/qr`} 
                            alt="Booking QR" 
                            style={{ width: 100, height: 100 }} 
                          />
                        </div>
                        <br/>
                        <button 
                          className="btn btn-sm btn-secondary" 
                          style={{ marginTop: 8 }}
                          onClick={async () => {
                            try {
                              const res = await bookingApi.getQrCode(b.id);
                              const url = window.URL.createObjectURL(new Blob([res.data]));
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', `booking-${b.id}-qr.png`);
                              document.body.appendChild(link);
                              link.click();
                            } catch (e) { toast.error("Failed to download QR"); }
                          }}
                        >
                          Download QR
                        </button>
                      </div>
                    )}
                    <div className="booking-actions">
                      {isAdmin && b.status === 'PENDING' && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => setRemarksModal({ id: b.id, action: 'approve' })}>
                            <HiOutlineCheck /> Approve
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => setRemarksModal({ id: b.id, action: 'reject' })}>
                            <HiOutlineX /> Reject
                          </button>
                        </>
                      )}
                      {!isAdmin && (b.status === 'PENDING' || b.status === 'APPROVED') && (
                        <button className="btn btn-sm btn-secondary" onClick={() => handleCancel(b.id)}>Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {remarksModal && (
          <div className="modal-overlay" onClick={() => setRemarksModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{remarksModal.action === 'approve' ? 'Approve' : 'Reject'} Booking</h2>
                <button className="modal-close" onClick={() => setRemarksModal(null)}>✕</button>
              </div>
              <div className="form-group">
                <label className="form-label">Remarks {remarksModal.action === 'reject' ? '*' : '(optional)'}</label>
                <textarea className="form-textarea" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add remarks..." required={remarksModal.action === 'reject'} id="booking-remarks" />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setRemarksModal(null)}>Cancel</button>
                <button className={`btn ${remarksModal.action === 'approve' ? 'btn-success' : 'btn-danger'}`} onClick={handleAction} id="booking-action-submit">
                  {remarksModal.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
