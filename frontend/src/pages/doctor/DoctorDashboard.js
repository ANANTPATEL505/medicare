import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DoctorDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/doctor/summary'),
      axios.get('/api/doctor/appointments?limit=5'),
    ])
      .then(([summaryRes, aptsRes]) => {
        setSummary(summaryRes.data);
        setAppointments(aptsRes.data.appointments || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Doctor Portal</h1>
            <p>Manage your appointments, patients, and prescriptions.</p>
          </div>
          <Link to="/doctor/prescriptions" className="btn btn-primary">New Prescription</Link>
        </div>

        <div className="stats-grid">
          {[
            { icon: '📋', label: 'Total Appointments', value: summary?.stats?.totalAppointments || 0, cls: 'teal' },
            { icon: '📅', label: 'Today', value: summary?.stats?.todayAppointments || 0, cls: 'navy' },
            { icon: '⏳', label: 'Pending', value: summary?.stats?.pendingAppointments || 0, cls: 'gold' },
            { icon: '👥', label: 'My Patients', value: summary?.stats?.totalPatients || 0, cls: 'red' },
            { icon: '💊', label: 'Prescriptions', value: summary?.stats?.totalPrescriptions || 0, cls: 'teal' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className={`stat-card-icon ${s.cls}`}>{s.icon}</div>
              <div className="stat-card-info">
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <Link to="/doctor/appointments" className="btn btn-outline" style={{ justifyContent: 'center' }}>Appointments</Link>
          <Link to="/doctor/patients" className="btn btn-outline" style={{ justifyContent: 'center' }}>Patients</Link>
          <Link to="/doctor/prescriptions" className="btn btn-outline" style={{ justifyContent: 'center' }}>Prescriptions</Link>
          <Link to="/ai-triage" className="btn btn-outline" style={{ justifyContent: 'center' }}>AI Triage Tool</Link>
        </div>

        <div className="table-card">
          <div className="table-header">
            <h3>Recent Appointments</h3>
            <Link to="/doctor/appointments" style={{ color: 'var(--teal)', fontWeight: 600, fontSize: '14px' }}>View all</Link>
          </div>
          {appointments.length === 0 ? (
            <div className="empty-state"><div className="icon">📭</div><h3>No appointments yet</h3></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 8).map((apt) => (
                  <tr key={apt._id}>
                    <td>{apt.patientName}</td>
                    <td>{new Date(apt.date).toLocaleDateString()}</td>
                    <td>{apt.timeSlot}</td>
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

export default DoctorDashboard;

