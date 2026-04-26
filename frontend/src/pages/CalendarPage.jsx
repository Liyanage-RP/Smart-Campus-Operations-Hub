import { useState, useEffect } from 'react';
import { bookingApi } from '../api/bookingApi';
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineCalendar } from 'react-icons/hi';
import './CalendarPage.css';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingApi.getAll();
        setBookings(res.data.filter(b => b.status === 'APPROVED'));
      } catch (err) {
        console.error('Failed to fetch bookings for calendar');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayBookings = bookings.filter(b => b.bookingDate === dateStr);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      cells.push(
        <div key={day} className={`calendar-cell ${isToday ? 'today' : ''}`}>
          <span className="day-number">{day}</span>
          <div className="day-bookings">
            {dayBookings.map(b => (
              <div key={b.id} className="calendar-event" title={`${b.facilityName}: ${b.startTime}-${b.endTime}`}>
                {b.facilityName.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Availability Calendar</h1>
          <p className="page-subtitle">View all approved bookings and resource availability</p>
        </div>

        <div className="glass-card calendar-container">
          <div className="calendar-header">
            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <div className="calendar-nav">
              <button onClick={prevMonth} className="nav-btn"><HiOutlineChevronLeft /></button>
              <button onClick={() => setCurrentDate(new Date())} className="nav-btn today-btn">Today</button>
              <button onClick={nextMonth} className="nav-btn"><HiOutlineChevronRight /></button>
            </div>
          </div>

          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="weekday-header">{d}</div>
            ))}
            {loading ? (
              <div className="calendar-loading">Loading bookings...</div>
            ) : renderCells()}
          </div>
        </div>
      </div>
    </div>
  );
}
