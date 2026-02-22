import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/prescriptions/my')
      .then(res => setPrescriptions(res.data))
      .catch(() => toast.error('Failed to load prescriptions'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>My Prescriptions 💊</h1>
            <p>View all prescriptions issued by your doctors</p>
          </div>
        </div>

        {prescriptions.length === 0 ? (
          <div className="empty-state">
            <div className="icon">💊</div>
            <h3>No prescriptions yet</h3>
            <p>Prescriptions issued after your appointments will appear here</p>
            <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '20px' }}>Book an Appointment</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {prescriptions.map(rx => (
              <div key={rx._id} style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', overflow: 'hidden', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--teal-dark))', padding: '20px', color: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>PRESCRIPTION</p>
                      <h3 style={{ fontSize: '18px', color: 'white' }}>{rx.diagnosis}</h3>
                    </div>
                    <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '50px', fontSize: '12px', color: 'var(--teal-light)' }}>
                      {rx.medicines?.length} medicines
                    </span>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Doctor</p>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--navy)' }}>{rx.doctor?.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--teal)' }}>{rx.doctor?.specialty}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Date</p>
                      <p style={{ fontSize: '14px', fontWeight: '600' }}>
                        {new Date(rx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '6px' }}>Medicines</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {rx.medicines?.slice(0, 3).map((m, i) => (
                        <span key={i} style={{ background: 'rgba(10,147,150,0.08)', color: 'var(--teal-dark)', padding: '2px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: '500' }}>{m.name}</span>
                      ))}
                      {rx.medicines?.length > 3 && <span style={{ color: 'var(--gray-400)', fontSize: '12px', padding: '2px 6px' }}>+{rx.medicines.length - 3} more</span>}
                    </div>
                  </div>
                  {rx.followUpDate && (
                    <div style={{ background: 'rgba(233,196,106,0.1)', border: '1px solid rgba(233,196,106,0.3)', borderRadius: '8px', padding: '10px', marginBottom: '16px' }}>
                      <p style={{ fontSize: '13px', color: '#92400e' }}>📅 Follow-up: {new Date(rx.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  )}
                  <Link to={`/patient/prescriptions/${rx._id}`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                    View Full Prescription
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
