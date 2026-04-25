import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { facilityApi } from '../api/facilityApi';
import { bookingApi } from '../api/bookingApi';
import { ticketApi } from '../api/ticketApi';
import { HiOutlineOfficeBuilding, HiOutlineCalendar, HiOutlineTicket, HiOutlineArrowRight } from 'react-icons/hi';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user, isAdmin, isTechnician } = useAuth();
  const [stats, setStats] = useState({ facilities: 0, bookings: [], tickets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facRes, bookRes, tickRes] = await Promise.all([
          facilityApi.getAll(),
          isAdmin ? bookingApi.getAll() : bookingApi.getMyBookings(),
          isAdmin || isTechnician ? ticketApi.getAll() : ticketApi.getMyTickets(),
        ]);
        setStats({
          facilities: facRes.data.length,
          bookings: bookRes.data,
          tickets: tickRes.data,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin, isTechnician]);

  const pendingBookings = stats.bookings.filter(b => b.status === 'PENDING').length;
  const approvedBookings = stats.bookings.filter(b => b.status === 'APPROVED').length;
  const openTickets = stats.tickets.filter(t => t.status === 'OPEN').length;
  const inProgressTickets = stats.tickets.filter(t => t.status === 'IN_PROGRESS').length;

  const statCards = [
    { icon: <HiOutlineOfficeBuilding />, label: 'Facilities', value: stats.facilities, color: 'var(--accent-primary)', link: '/facilities' },
    { icon: <HiOutlineCalendar />, label: isAdmin ? 'Pending Bookings' : 'My Bookings', value: isAdmin ? pendingBookings : stats.bookings.length, color: 'var(--accent-warning)', link: '/bookings' },
    { icon: <HiOutlineCalendar />, label: 'Approved Bookings', value: approvedBookings, color: 'var(--accent-success)', link: '/bookings' },
    { icon: <HiOutlineTicket />, label: 'Open Tickets', value: openTickets, color: 'var(--accent-danger)', link: '/tickets' },
    { icon: <HiOutlineTicket />, label: 'In Progress', value: inProgressTickets, color: '#a855f7', link: '/tickets' },
  ];

  const recentBookings = stats.bookings.slice(0, 5);
  const recentTickets = stats.tickets.slice(0, 5);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening on your campus today</p>
        </div>

        {loading ? (
          <div className="grid grid-4">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
          </div>
        ) : (
          <>
            <div className="stat-cards">
              {statCards.map((card, i) => (
                <Link key={i} to={card.link} className="stat-card glass-card">
                  <div className="stat-icon" style={{ color: card.color, background: card.color + '15' }}>
                    {card.icon}
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{card.value}</span>
                    <span className="stat-label">{card.label}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-section glass-card">
                <div className="section-header">
                  <h2>Recent Bookings</h2>
                  <Link to="/bookings" className="section-link">View all <HiOutlineArrowRight /></Link>
                </div>
                {recentBookings.length === 0 ? (
                  <p className="section-empty">No bookings yet</p>
                ) : (
                  <div className="section-list">
                    {recentBookings.map(b => (
                      <div key={b.id} className="section-item">
                        <div>
                          <p className="item-title">{b.facilityName}</p>
                          <p className="item-subtitle">{b.bookingDate} · {b.startTime} - {b.endTime}</p>
                        </div>
                        <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dashboard-section glass-card">
                <div className="section-header">
                  <h2>Recent Tickets</h2>
                  <Link to="/tickets" className="section-link">View all <HiOutlineArrowRight /></Link>
                </div>
                {recentTickets.length === 0 ? (
                  <p className="section-empty">No tickets yet</p>
                ) : (
                  <div className="section-list">
                    {recentTickets.map(t => (
                      <Link key={t.id} to={`/tickets/${t.id}`} className="section-item">
                        <div>
                          <p className="item-title">{t.category}: {t.description?.substring(0, 50)}...</p>
                          <p className="item-subtitle">{t.facilityName} · {t.priority}</p>
                        </div>
                        <span className={`badge badge-${t.status.toLowerCase()}`}>{t.status.replace('_', ' ')}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
