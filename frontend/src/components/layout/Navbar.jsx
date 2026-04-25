import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useState } from 'react';
import { HiOutlineBell, HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';
import NotificationPanel from '../notifications/NotificationPanel';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin, isTechnician } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/facilities', label: 'Facilities' },
    { path: '/bookings', label: 'Bookings' },
    { path: '/tickets', label: 'Tickets' },
  ];

  if (isAdmin) {
    navLinks.push({ path: '/admin', label: 'Admin' });
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/dashboard" className="navbar-brand">
          <span className="navbar-logo">🏛️</span>
          <span className="navbar-title">Smart Campus</span>
        </Link>

        <div className={`navbar-links ${showMobileMenu ? 'active' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${location.pathname.startsWith(link.path) ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <div className="notification-wrapper">
            <button
              className="navbar-icon-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              id="notification-bell"
            >
              <HiOutlineBell size={22} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <NotificationPanel onClose={() => setShowNotifications(false)} />
            )}
          </div>

          <div className="navbar-user">
            <div className="navbar-avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} />
              ) : (
                <HiOutlineUser size={18} />
              )}
            </div>
            <span className="navbar-username">{user?.name?.split(' ')[0]}</span>
          </div>

          <button className="navbar-icon-btn logout-btn" onClick={handleLogout} title="Logout">
            <HiOutlineLogout size={20} />
          </button>

          <button
            className="navbar-mobile-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
