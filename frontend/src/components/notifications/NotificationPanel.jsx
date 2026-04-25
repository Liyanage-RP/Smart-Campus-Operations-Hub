import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { HiOutlineCheckCircle, HiOutlineX, HiOutlineCheck } from 'react-icons/hi';
import './NotificationPanel.css';

export default function NotificationPanel({ onClose }) {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING_APPROVED': return '✅';
      case 'BOOKING_REJECTED': return '❌';
      case 'TICKET_STATUS': return '🔄';
      case 'TICKET_COMMENT': return '💬';
      case 'TICKET_ASSIGNED': return '👤';
      default: return '🔔';
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
      <div className="notification-panel-header">
        <h3>Notifications</h3>
        <div className="notification-panel-actions">
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={markAllAsRead}>
              <HiOutlineCheck size={14} /> Mark all read
            </button>
          )}
          <button className="modal-close" onClick={onClose}><HiOutlineX size={18} /></button>
        </div>
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="notification-empty">
            <span>🔔</span>
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`notification-item ${!n.read ? 'unread' : ''}`}
              onClick={() => handleClick(n)}
            >
              <span className="notification-icon">{getIcon(n.type)}</span>
              <div className="notification-body">
                <p className="notification-title">{n.title}</p>
                <p className="notification-message">{n.message}</p>
                <span className="notification-time">{timeAgo(n.createdAt)}</span>
              </div>
              {!n.read && <span className="notification-dot" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
