import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { facilityApi } from '../api/facilityApi';
import { bookingApi } from '../api/bookingApi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { HiOutlineLocationMarker, HiOutlineUsers, HiOutlineClock, HiOutlineArrowLeft } from 'react-icons/hi';
import './FacilityDetailPage.css';

export default function FacilityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    bookingDate: '', startTime: '', endTime: '', purpose: '', expectedAttendees: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    facilityApi.getById(id).then(res => setFacility(res.data)).catch(() => toast.error('Facility not found')).finally(() => setLoading(false));
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bookingApi.create({ facilityId: id, ...bookingForm, expectedAttendees: parseInt(bookingForm.expectedAttendees) });
      toast.success('Booking request submitted!');
      setShowBooking(false);
      setBookingForm({ bookingDate: '', startTime: '', endTime: '', purpose: '', expectedAttendees: 1 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page"><div className="container"><div className="skeleton" style={{ height: 400, borderRadius: 16 }} /></div></div>;
  if (!facility) return <div className="page"><div className="container"><p>Facility not found</p></div></div>;

  return (
    <div className="page">
      <div className="container">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/facilities')} style={{ marginBottom: 24 }}>
          <HiOutlineArrowLeft /> Back to Facilities
        </button>

        <div className="facility-detail glass-card">
          <div className="facility-detail-header">
            <div>
              <span className={`badge badge-${facility.status.toLowerCase()}`}>{facility.status.replace('_', ' ')}</span>
              <h1 className="facility-detail-name">{facility.name}</h1>
            </div>
            {facility.status === 'ACTIVE' && isAuthenticated && (
              <button className="btn btn-primary btn-lg" onClick={() => setShowBooking(true)} id="book-facility-btn">
                Book This Facility
              </button>
            )}
          </div>

          <p className="facility-detail-desc">{facility.description}</p>

          <div className="facility-detail-info">
            <div className="info-item"><HiOutlineLocationMarker /><span>{facility.location}</span></div>
            <div className="info-item"><HiOutlineUsers /><span>Capacity: {facility.capacity}</span></div>
            {facility.availableFrom && <div className="info-item"><HiOutlineClock /><span>{facility.availableFrom} - {facility.availableTo}</span></div>}
          </div>
        </div>

        {showBooking && (
          <div className="modal-overlay" onClick={() => setShowBooking(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Book {facility.name}</h2>
                <button className="modal-close" onClick={() => setShowBooking(false)}>✕</button>
              </div>
              <form onSubmit={handleBooking}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input className="form-input" type="date" value={bookingForm.bookingDate} onChange={(e) => setBookingForm(p => ({ ...p, bookingDate: e.target.value }))} required min={new Date().toISOString().split('T')[0]} id="booking-date" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Start Time *</label>
                    <input className="form-input" type="time" value={bookingForm.startTime} onChange={(e) => setBookingForm(p => ({ ...p, startTime: e.target.value }))} required id="booking-start" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time *</label>
                    <input className="form-input" type="time" value={bookingForm.endTime} onChange={(e) => setBookingForm(p => ({ ...p, endTime: e.target.value }))} required id="booking-end" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose *</label>
                  <textarea className="form-textarea" value={bookingForm.purpose} onChange={(e) => setBookingForm(p => ({ ...p, purpose: e.target.value }))} required placeholder="Describe the purpose of your booking..." id="booking-purpose" />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Attendees</label>
                  <input className="form-input" type="number" min="1" max={facility.capacity} value={bookingForm.expectedAttendees} onChange={(e) => setBookingForm(p => ({ ...p, expectedAttendees: e.target.value }))} id="booking-attendees" />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowBooking(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting} id="booking-submit">{submitting ? 'Submitting...' : 'Submit Booking'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
