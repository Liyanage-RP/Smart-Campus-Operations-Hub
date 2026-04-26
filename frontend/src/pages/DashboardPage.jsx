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
          facilitiesList: facRes.data,
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

  const totalUsage = stats.facilitiesList?.reduce((acc, f) => acc + (f.usageCount || 0), 0) || 0;

  const statCards = [
    { icon: <HiOutlineOfficeBuilding />, label: 'Facilities', value: stats.facilities, color: 'var(--accent-primary)', link: '/facilities' },
    { icon: <span style={{ fontSize: '1.2em' }}>📊</span>, label: 'Total Usage', value: totalUsage, color: '#06b6d4', link: '/facilities' },
    { icon: <HiOutlineCalendar />, label: isAdmin ? 'Pending Bookings' : 'My Bookings', value: isAdmin ? pendingBookings : stats.bookings.length, color: 'var(--accent-warning)', link: '/bookings' },
    { icon: <HiOutlineCalendar />, label: 'Approved Bookings', value: approvedBookings, color: 'var(--accent-success)', link: '/bookings' },
    { icon: <HiOutlineTicket />, label: 'Open Tickets', value: openTickets, color: 'var(--accent-danger)', link: '/tickets' },
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
              <div className="dashboard-section glass-card analytics-section">
                <div className="section-header">
                  <h2>Resource Usage Analytics</h2>
                  <span className="badge badge-info">Live Insights</span>
                </div>
                <div className="analytics-container">
                  <div className="chart-group">
                    <h3 className="chart-title">Top Resources by Usage</h3>
                    <div className="bar-chart">
                      {stats.facilitiesList?.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 5).map((f, i) => {
                        const maxUsage = Math.max(...stats.facilitiesList.map(fac => fac.usageCount || 1));
                        const width = ((f.usageCount || 0) / maxUsage) * 100;
                        return (
                          <div key={i} className="bar-row">
                            <span className="bar-label">{f.name}</span>
                            <div className="bar-wrapper">
                              <div className="bar-fill" style={{ width: `${width}%`, background: `linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))` }}></div>
                              <span className="bar-value">{f.usageCount || 0}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="chart-group">
                    <h3 className="chart-title">Peak Booking Hours</h3>
                    <div className="line-chart-placeholder">
                      <div className="hour-bars">
                        {[8, 10, 12, 14, 16, 18, 20].map(h => {
                          const bookingsAtHour = stats.bookings.filter(b => parseInt(b.startTime?.split(':')[0]) === h).length;
                          const height = (bookingsAtHour / (stats.bookings.length || 1)) * 100 + 10;
                          return (
                            <div key={h} className="hour-bar-wrapper">
                              <div className="hour-bar" style={{ height: `${height}%` }}>
                                {bookingsAtHour > 0 && <span className="hour-val">{bookingsAtHour}</span>}
                              </div>
                              <span className="hour-label">{h}:00</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
