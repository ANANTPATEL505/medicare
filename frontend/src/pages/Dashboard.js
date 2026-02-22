import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/appointments/my'),
      axios.get('/api/prescriptions/my')
    ]).then(([aptsRes, rxRes]) => {
      setAppointments(aptsRes.data);
      setPrescriptions(rxRes.data);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const cancelAppointment = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await axios.delete(`/api/appointments/${id}`);
      toast.success('Appointment cancelled');
      setAppointments(prev => prev.filter(a => a._id !== id));
    } catch { toast.error('Failed to cancel'); }
  };

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length,
    completed: appointments.filter(a => a.status === 'completed').length,
    prescriptions: prescriptions.length,
  };

  const quickLinks = [
    { icon: '🔍', label: 'Find a Doctor', link: '/doctors', color: 'var(--teal)' },
    { icon: '🧠', label: 'AI Symptom Check', link: '/ai-triage', color: '#023e8a' },
    { icon: '💊', label: 'Prescriptions', link: '/patient/prescriptions', color: '#7b2d8b' },
    { icon: '📁', label: 'Medical History', link: '/patient/history', color: '#264653' },
    { icon: '⚙️', label: 'Profile Settings', link: '/patient/profile', color: 'var(--gray-600)' },
    { icon: '🔔', label: 'Notifications', link: '/patient/notifications', color: '#e76f51' },
    { icon: '📰', label: 'Health Blog', link: '/blog', color: '#0a9396' },
  ];

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p>Manage your health and appointments</p>
          </div>
          <Link to="/doctors" className="btn btn-primary">+ Book Appointment</Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: '📋', label: 'Total Appointments', value: stats.total, cls: 'teal' },
            { icon: '📅', label: 'Upcoming', value: stats.upcoming, cls: 'navy' },
            { icon: '✅', label: 'Completed', value: stats.completed, cls: 'gold' },
            { icon: '💊', label: 'Prescriptions', value: stats.prescriptions, cls: 'red' },
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

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginBottom: '32px' }}>
          {quickLinks.map(ql => (
            <Link key={ql.label} to={ql.link}
              style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '20px', textAlign: 'center', display: 'block', transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ql.color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{ql.icon}</div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--navy)' }}>{ql.label}</p>
            </Link>
          ))}
        </div>

        {/* Appointments Table */}
        <div className="table-card">
          <div className="table-header">
            <h3>My Appointments</h3>
            <Link to="/patient/history" style={{ color: 'var(--teal)', fontSize: '14px', fontWeight: '600' }}>Full History →</Link>
          </div>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📅</div>
              <h3>No appointments yet</h3>
              <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '20px' }}>Book Your First Appointment</Link>
            </div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Doctor</th><th>Specialty</th><th>Date & Time</th><th>Fee</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {appointments.slice(0, 8).map(apt => (
                  <tr key={apt._id}>
                    <td><strong>{apt.doctor?.name}</strong></td>
                    <td>{apt.doctor?.specialty}</td>
                    <td>{new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {apt.timeSlot}</td>
                    <td>₹{apt.fee}</td>
                    <td><span className={`badge badge-${apt.status}`}>{apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link to={`/doctors/${apt.doctor?._id}`} className="btn btn-outline btn-sm">View Dr.</Link>
                        {apt.status === 'pending' && (
                          <button onClick={() => cancelAppointment(apt._id)} className="btn btn-danger btn-sm">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Prescriptions */}
        {prescriptions.length > 0 && (
          <div className="table-card" style={{ marginTop: '24px' }}>
            <div className="table-header">
              <h3>Recent Prescriptions</h3>
              <Link to="/patient/prescriptions" style={{ color: 'var(--teal)', fontSize: '14px', fontWeight: '600' }}>View All →</Link>
            </div>
            <table className="data-table">
              <thead><tr><th>Diagnosis</th><th>Doctor</th><th>Date</th><th>Medicines</th><th>Action</th></tr></thead>
              <tbody>
                {prescriptions.slice(0, 3).map(rx => (
                  <tr key={rx._id}>
                    <td><strong>{rx.diagnosis}</strong></td>
                    <td>{rx.doctor?.name} <span style={{ fontSize: '12px', color: 'var(--teal)' }}>({rx.doctor?.specialty})</span></td>
                    <td>{new Date(rx.createdAt).toLocaleDateString()}</td>
                    <td><span style={{ background: 'rgba(10,147,150,0.08)', color: 'var(--teal)', padding: '3px 10px', borderRadius: '50px', fontSize: '12px' }}>{rx.medicines?.length} medicines</span></td>
                    <td><Link to={`/patient/prescriptions/${rx._id}`} className="btn btn-outline btn-sm">View Rx</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
