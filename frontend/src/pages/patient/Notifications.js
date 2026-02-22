import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const typeIcons = { appointment: '📅', prescription: '💊', review: '⭐', system: '🔔', payment: '💳' };

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications/my');
      setNotifications(res.data.notifications);
      setUnread(res.data.unread);
    } catch { toast.error('Failed to load notifications'); }
  };

  const markAllRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      fetchNotifications();
      toast.success('All marked as read');
    } catch {}
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      fetchNotifications();
    } catch {}
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return Math.floor(hours / 24) + 'd ago';
  };

  return (
    <div className="dashboard">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="dashboard-header">
          <div>
            <h1>Notifications 🔔</h1>
            <p>{unread} unread notifications</p>
          </div>
          {unread > 0 && <button className="btn btn-outline" onClick={markAllRead}>Mark All Read</button>}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔔</div>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map(n => (
              <div key={n._id} style={{ background: n.isRead ? 'white' : 'rgba(10,147,150,0.04)', border: `1px solid ${n.isRead ? 'var(--gray-200)' : 'var(--teal-light)'}`, borderRadius: 'var(--radius)', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '28px', flexShrink: 0 }}>{typeIcons[n.type] || '🔔'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '16px', color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{n.title}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--gray-400)', whiteSpace: 'nowrap', marginLeft: '16px' }}>{timeAgo(n.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--gray-600)', margin: 0 }}>{n.message}</p>
                  {n.link && <Link to={n.link} style={{ fontSize: '13px', color: 'var(--teal)', fontWeight: 600, marginTop: '8px', display: 'inline-block' }}>View →</Link>}
                </div>
                <button onClick={() => deleteNotification(n._id)} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '18px', flexShrink: 0 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
