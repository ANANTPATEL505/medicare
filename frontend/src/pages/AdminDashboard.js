import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/patients/stats'),
      axios.get('/api/appointments?limit=5')
    ]).then(([statsRes, aptsRes]) => {
      setStats(statsRes.data);
      setRecentAppointments(aptsRes.data.appointments || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const adminModules = [
    { icon: '📊', label: 'Analytics', sub: 'Charts & insights', link: '/admin/analytics', color: 'var(--teal)' },
    { icon: '👨‍⚕️', label: 'Doctors', sub: `${stats.totalDoctors || 0} registered`, link: '/admin/doctors', color: '#264653' },
    { icon: '📅', label: 'Appointments', sub: `${stats.totalAppointments || 0} total`, link: '/admin/appointments', color: '#e76f51' },
    { icon: '👥', label: 'Patients', sub: `${stats.totalPatients || 0} registered`, link: '/admin/patients', color: '#7b2d8b' },
    { icon: '💊', label: 'Prescriptions', sub: 'Manage prescriptions', link: '/admin/prescriptions', color: '#0a9396' },
    { icon: '📰', label: 'Blog', sub: 'Articles & content', link: '/admin/blogs', color: '#e9c46a', textColor: '#92400e' },
    { icon: '📬', label: 'Messages', sub: `${stats.pendingAppointments || 0} pending`, link: '/admin/messages', color: '#023e8a' },
    { icon: '🧾', label: 'Audit Logs', sub: 'System traceability', link: '/admin/logs', color: '#0f766e' },
    { icon: '⚙️', label: 'Settings', sub: 'System configuration', link: '/admin/settings', color: 'var(--gray-600)' },
  ];

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Admin Control Panel 🛡️</h1>
            <p>Hospital management overview and quick access</p>
          </div>
          <Link to="/admin/analytics" className="btn btn-primary">📊 View Full Analytics</Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: '👥', label: 'Total Patients', value: stats.totalPatients || 0, cls: 'teal' },
            { icon: '👨‍⚕️', label: 'Total Doctors', value: stats.totalDoctors || 0, cls: 'navy' },
            { icon: '📋', label: 'All Appointments', value: stats.totalAppointments || 0, cls: 'gold' },
            { icon: '⏳', label: 'Pending', value: stats.pendingAppointments || 0, cls: 'red' },
            { icon: '✅', label: 'Completed', value: stats.completedAppointments || 0, cls: 'teal' },
            { icon: '📅', label: "Today's Appointments", value: stats.todayAppointments || 0, cls: 'navy' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`stat-card-icon ${s.cls}`}>{s.icon}</div>
              <div className="stat-card-info">
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Modules Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {adminModules.map(mod => (
            <Link key={mod.label} to={mod.link}
              style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '24px', display: 'block', transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = mod.color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{mod.icon}</div>
              <h4 style={{ fontSize: '16px', color: 'var(--navy)', marginBottom: '4px' }}>{mod.label}</h4>
              <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{mod.sub}</p>
            </Link>
          ))}
        </div>

        {/* Recent Appointments */}
        <div className="table-card">
          <div className="table-header">
            <h3>Recent Appointments</h3>
            <Link to="/admin/appointments" style={{ color: 'var(--teal)', fontSize: '14px', fontWeight: '600' }}>View All →</Link>
          </div>
          {recentAppointments.length === 0 ? (
            <div className="empty-state"><div className="icon">📅</div><h3>No appointments yet</h3></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Fee</th><th>Status</th></tr></thead>
              <tbody>
                {recentAppointments.map(apt => (
                  <tr key={apt._id}>
                    <td><strong>{apt.patientName}</strong></td>
                    <td>{apt.doctor?.name} <span style={{ fontSize: '12px', color: 'var(--teal)' }}>({apt.doctor?.specialty})</span></td>
                    <td>{new Date(apt.date).toLocaleDateString()} at {apt.timeSlot}</td>
                    <td>₹{apt.fee}</td>
                    <td><span className={`badge badge-${apt.status}`}>{apt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
