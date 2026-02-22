import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/contact');
      setMessages(res.data);
    } finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try { await axios.put(`/api/contact/${id}/read`); fetchMessages(); }
    catch {}
  };

  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.isRead;
    if (filter === 'read') return m.isRead;
    return true;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Contact Messages 📬</h1>
            <p>{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Message List */}
          <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-200)' }}>
              <div className="tabs" style={{ margin: 0 }}>
                {['all', 'unread', 'read'].map(f => (
                  <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ padding: '6px 14px', fontSize: '13px' }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {loading ? <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                : filtered.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)' }}>No messages</div>
                : filtered.map(msg => (
                  <div key={msg._id} onClick={() => { setSelected(msg); if (!msg.isRead) markRead(msg._id); }}
                    style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', background: selected?._id === msg._id ? 'rgba(10,147,150,0.05)' : msg.isRead ? 'white' : 'rgba(10,147,150,0.02)', borderLeft: selected?._id === msg._id ? '3px solid var(--teal)' : '3px solid transparent', transition: 'var(--transition)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--navy)' }}>{msg.name}</strong>
                      {!msg.isRead && <span style={{ width: '8px', height: '8px', background: 'var(--teal)', borderRadius: '50%', flexShrink: 0, marginTop: '4px' }}></span>}
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-700)', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.subject}</p>
                    <p style={{ fontSize: '12px', color: 'var(--gray-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.message.slice(0, 60)}...</p>
                    <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '6px' }}>{new Date(msg.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Message Detail */}
          {selected ? (
            <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '22px', color: 'var(--navy)', marginBottom: '4px' }}>{selected.subject}</h3>
                  <p style={{ color: 'var(--gray-400)', fontSize: '13px' }}>{new Date(selected.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <span style={{ background: selected.isRead ? 'rgba(42,157,143,0.1)' : 'rgba(10,147,150,0.1)', color: selected.isRead ? 'var(--green)' : 'var(--teal)', padding: '4px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' }}>
                  {selected.isRead ? '✓ Read' : 'New'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '20px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', marginBottom: '24px' }}>
                {[
                  { label: 'From', value: selected.name },
                  { label: 'Email', value: selected.email },
                  { label: 'Phone', value: selected.phone || 'Not provided' },
                  { label: 'Subject', value: selected.subject },
                ].map(item => (
                  <div key={item.label}>
                    <p style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</p>
                    <p style={{ fontWeight: '600', color: 'var(--navy)', fontSize: '14px' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '24px', marginBottom: '24px' }}>
                <p style={{ color: 'var(--gray-700)', lineHeight: '1.8', fontSize: '15px' }}>{selected.message}</p>
              </div>

              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="btn btn-primary">
                📧 Reply via Email
              </a>
            </div>
          ) : (
            <div className="empty-state">
              <div className="icon">📬</div>
              <h3>Select a message</h3>
              <p>Click on a message to view its details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
