import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      // Quiet fail if not logged in
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20s poll
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.2rem',
          cursor: 'pointer',
          position: 'relative',
          padding: '0.2rem 0.4rem',
        }}
        title="In-App Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '2rem',
            right: 0,
            width: '320px',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 1100,
            padding: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.35rem' }}>
            <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Society Alerts</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleMarkRead(n._id)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '4px',
                    marginBottom: '0.35rem',
                    background: n.isRead ? '#ffffff' : '#eff6ff',
                    border: n.isRead ? '1px solid #f3f4f6' : '1px solid #bfdbfe',
                    cursor: 'pointer',
                  }}
                >
                  <p style={{ fontWeight: '600', fontSize: '0.8rem', color: '#1f2937' }}>{n.title}</p>
                  <p style={{ fontSize: '0.75rem', color: '#4b5563', margin: '0.2rem 0' }}>{n.message}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9ca3af' }}>
                    <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {n.link && (
                      <Link to={n.link} onClick={() => setOpen(false)} style={{ color: '#2563eb' }}>
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
