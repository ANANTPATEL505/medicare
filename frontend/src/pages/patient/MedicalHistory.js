import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MedicalHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    Promise.all([
      axios.get('/api/appointments/my'),
      axios.get('/api/prescriptions/my')
    ]).then(([aptsRes, rxRes]) => {
      setAppointments(aptsRes.data);
      setPrescriptions(rxRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const completed = appointments.filter(a => a.status === 'completed');
  const totalSpent = appointments.filter(a => a.status === 'completed' && a.isPaid).reduce((s, a) => s + (a.fee || 0), 0);

  const allDoctors = [...new Set(appointments.map(a => a.doctor?.name).filter(Boolean))];

  const timeline = [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Medical History 📁</h1>
            <p>Your complete health journey at MediCare</p>
          </div>
          <Link to="/doctors" className="btn btn-primary">+ Book Appointment</Link>
        </div>

        {/* Summary cards */}
        <div className="stats-grid" style={{ marginBottom: '32px' }}>
          {[
            { icon: '🏥', label: 'Total Visits', value: appointments.length, cls: 'teal' },
            { icon: '✅', label: 'Completed', value: completed.length, cls: 'navy' },
            { icon: '💊', label: 'Prescriptions', value: prescriptions.length, cls: 'gold' },
            { icon: '👨‍⚕️', label: 'Doctors Visited', value: allDoctors.length, cls: 'teal' },
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

        <div className="tabs">
          {['timeline', 'appointments', 'prescriptions', 'doctors'].map(t => (
            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'timeline' && (
          <div style={{ position: 'relative', paddingLeft: '32px' }}>
            <div style={{ position: 'absolute', left: '11px', top: 0, bottom: 0, width: '2px', background: 'var(--gray-200)' }}></div>
            {timeline.length === 0 ? (
              <div className="empty-state"><div className="icon">📅</div><h3>No history yet</h3></div>
            ) : timeline.map((apt, i) => (
              <div key={apt._id} style={{ position: 'relative', marginBottom: '24px' }}>
                <div style={{ position: 'absolute', left: '-27px', width: '16px', height: '16px', borderRadius: '50%', background: apt.status === 'completed' ? 'var(--teal)' : apt.status === 'cancelled' ? 'var(--red)' : 'var(--gold)', border: '3px solid white', boxShadow: 'var(--shadow-sm)' }}></div>
                <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '20px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: 'var(--navy)' }}>{apt.doctor?.name}</span>
                      <span style={{ marginLeft: '10px', fontSize: '13px', color: 'var(--teal)', background: 'rgba(10,147,150,0.08)', padding: '2px 10px', borderRadius: '50px' }}>{apt.doctor?.specialty}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                      <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {apt.timeSlot}</span>
                    </div>
                  </div>
                  {apt.symptoms && <p style={{ fontSize: '14px', color: 'var(--gray-600)', margin: 0 }}>Reason: {apt.symptoms}</p>}
                  {apt.fee && <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '6px' }}>Fee: ₹{apt.fee}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="table-card">
            <div className="table-header"><h3>All Appointments</h3></div>
            <table className="data-table">
              <thead><tr><th>Doctor</th><th>Specialty</th><th>Date & Time</th><th>Symptoms</th><th>Fee</th><th>Status</th></tr></thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt._id}>
                    <td><strong>{apt.doctor?.name}</strong></td>
                    <td>{apt.doctor?.specialty}</td>
                    <td>{new Date(apt.date).toLocaleDateString()} {apt.timeSlot}</td>
                    <td style={{ maxWidth: '200px', fontSize: '13px', color: 'var(--gray-600)' }}>{apt.symptoms || '—'}</td>
                    <td>₹{apt.fee}</td>
                    <td><span className={`badge badge-${apt.status}`}>{apt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          prescriptions.length === 0 ? (
            <div className="empty-state"><div className="icon">💊</div><h3>No prescriptions</h3></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {prescriptions.map(rx => (
                <div key={rx._id} style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h4 style={{ color: 'var(--navy)', marginBottom: '4px' }}>{rx.diagnosis}</h4>
                    <p style={{ fontSize: '14px', color: 'var(--gray-600)' }}>Dr. {rx.doctor?.name} • {rx.doctor?.specialty}</p>
                    <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{new Date(rx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(10,147,150,0.08)', color: 'var(--teal)', padding: '4px 12px', borderRadius: '50px', fontSize: '13px' }}>{rx.medicines?.length} medicines</span>
                    <Link to={`/patient/prescriptions/${rx._id}`} className="btn btn-outline btn-sm">View</Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'doctors' && (
          allDoctors.length === 0 ? (
            <div className="empty-state"><div className="icon">👨‍⚕️</div><h3>No doctors visited yet</h3></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {allDoctors.map(name => {
                const doctorApts = appointments.filter(a => a.doctor?.name === name);
                const doc = doctorApts[0]?.doctor;
                return (
                  <div key={name} style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '24px', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '22px', margin: '0 auto 16px' }}>
                      {name?.split(' ').filter(n => n !== 'Dr.').slice(0, 2).map(n => n[0]).join('')}
                    </div>
                    <h4 style={{ color: 'var(--navy)', marginBottom: '4px' }}>{name}</h4>
                    <p style={{ color: 'var(--teal)', fontSize: '14px', marginBottom: '12px' }}>{doc?.specialty}</p>
                    <p style={{ color: 'var(--gray-400)', fontSize: '13px' }}>{doctorApts.length} visit{doctorApts.length !== 1 ? 's' : ''}</p>
                    {doc?._id && <Link to={`/doctors/${doc._id}`} className="btn btn-outline btn-sm" style={{ marginTop: '12px' }}>View Profile</Link>}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;
