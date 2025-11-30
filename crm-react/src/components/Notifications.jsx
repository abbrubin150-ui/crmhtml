import { useState, useRef, useEffect } from 'react';

const Notifications = ({ notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, onNotificationClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowDropdown(false);
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'notification-high';
      case 'medium': return 'notification-medium';
      case 'low': return 'notification-low';
      default: return '';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMinutes = Math.floor((now - notifTime) / (60 * 1000));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="notifications-container" ref={dropdownRef}>
      <button
        className="pill ghost notification-bell"
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ position: 'relative' }}
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3 style={{ margin: 0, fontSize: '1rem' }}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {notifications.length > 0 && (
              <button
                className="text-button"
                onClick={markAllAsRead}
                style={{ fontSize: '0.85rem', color: 'var(--accent)' }}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="notifications-empty">
                <i className="fas fa-check-circle" style={{ fontSize: '2rem', color: 'var(--ok)', marginBottom: '0.5rem' }}></i>
                <p style={{ margin: 0, color: 'var(--muted)' }}>All caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${getPriorityClass(notification.priority)} ${notification.read ? 'read' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    className="notification-icon"
                    style={{ backgroundColor: notification.color }}
                  >
                    <i className={`fas ${notification.icon}`}></i>
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-timestamp">{formatTimestamp(notification.timestamp)}</div>
                  </div>
                  <button
                    className="notification-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
