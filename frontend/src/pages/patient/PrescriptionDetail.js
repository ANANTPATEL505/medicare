import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const PrescriptionDetail = () => {
  const { id } = useParams();
  const [rx, setRx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/prescriptions/${id}`)
      .then(res => setRx(res.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Prescription not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!rx) return <div className="empty-state"><div className="icon">❌</div><h3>Prescription not found</h3><Link to="/patient/prescriptions" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Prescriptions</Link></div>;

  return (
    <div style={{ paddingTop: '100px', background: 'var(--gray-50)', minHeight: '100vh', paddingBottom: '60px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Link to="/patient/prescriptions" style={{ color: 'var(--teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>← Back to Prescriptions</Link>
          <button onClick={() => window.print()} className="btn btn-outline btn-sm">🖨️ Print</button>
        </div>

        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--teal-dark))', padding: '32px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="logo" style={{ color: 'white', marginBottom: '8px' }}>
                  <div className="logo-icon">✚</div>
                  <span style={{ color: 'white', fontSize: '20px' }}>Medi<span style={{ color: '#94d2bd' }}>Care</span></span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>123 Medical Center Drive, New York, NY 10001</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Rx #</p>
                <p style={{ color: 'white', fontWeight: '700', fontFamily: 'monospace', fontSize: '14px' }}>{rx._id?.slice(-8).toUpperCase()}</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '8px' }}>{new Date(rx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div style={{ padding: '32px' }}>
            {/* Doctor & Patient Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px', padding: '24px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Prescribing Doctor</p>
                <p style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '16px' }}>{rx.doctor?.name}</p>
                <p style={{ color: 'var(--teal)', fontSize: '14px' }}>{rx.doctor?.specialty}</p>
                <p style={{ color: 'var(--gray-600)', fontSize: '13px' }}>{rx.doctor?.qualification}</p>
                {rx.doctor?.phone && <p style={{ color: 'var(--gray-600)', fontSize: '13px' }}>📞 {rx.doctor?.phone}</p>}
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Patient</p>
                <p style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '16px' }}>{rx.patient?.name}</p>
                <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>{rx.patient?.email}</p>
                {rx.patient?.phone && <p style={{ color: 'var(--gray-600)', fontSize: '13px' }}>📞 {rx.patient?.phone}</p>}
                {rx.appointment?.date && <p style={{ color: 'var(--gray-600)', fontSize: '13px' }}>Visit: {new Date(rx.appointment.date).toLocaleDateString()}</p>}
              </div>
            </div>

            {/* Diagnosis */}
            <div style={{ marginBottom: '28px', padding: '20px', background: 'rgba(10,147,150,0.05)', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--teal)' }}>
              <p style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Diagnosis</p>
              <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--navy)' }}>{rx.diagnosis}</p>
            </div>

            {/* Medicines */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>💊 Prescribed Medicines</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rx.medicines?.map((med, i) => (
                  <div key={i} style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '16px', display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px' }}>{i + 1}</div>
                    <div>
                      <p style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '15px' }}>{med.name}</p>
                      <p style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Dosage: {med.dosage}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Frequency</p>
                      <p style={{ fontWeight: '600', fontSize: '14px' }}>{med.frequency}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Duration</p>
                      <p style={{ fontWeight: '600', fontSize: '14px' }}>{med.duration}</p>
                    </div>
                    {med.instructions && <div style={{ gridColumn: '2 / -1', background: 'var(--gray-50)', borderRadius: '6px', padding: '8px 12px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--gray-600)' }}>📝 {med.instructions}</p>
                    </div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Lab Tests */}
            {rx.labTests?.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--navy)', marginBottom: '16px' }}>🔬 Lab Tests</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {rx.labTests.map((test, i) => (
                    <span key={i} style={{ background: 'rgba(233,196,106,0.15)', border: '1px solid rgba(233,196,106,0.4)', color: '#92400e', padding: '6px 16px', borderRadius: '50px', fontSize: '14px', fontWeight: '600' }}>
                      🧪 {test}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Advice */}
            {rx.advice && (
              <div style={{ marginBottom: '28px', padding: '20px', background: 'rgba(42,157,143,0.05)', borderRadius: 'var(--radius)', border: '1px solid rgba(42,157,143,0.2)' }}>
                <h3 style={{ fontSize: '16px', color: 'var(--navy)', marginBottom: '10px' }}>📋 Doctor's Advice</h3>
                <p style={{ fontSize: '15px', color: 'var(--gray-600)', lineHeight: '1.7' }}>{rx.advice}</p>
              </div>
            )}

            {/* Follow-up */}
            {rx.followUpDate && (
              <div style={{ background: 'rgba(233,196,106,0.1)', border: '1px solid rgba(233,196,106,0.4)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '28px' }}>
                <p style={{ fontWeight: '700', color: '#92400e' }}>📅 Follow-up Appointment</p>
                <p style={{ color: '#92400e', fontSize: '15px' }}>{new Date(rx.followUpDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            )}

            {/* Signature */}
            <div style={{ borderTop: '2px dashed var(--gray-200)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '200px', borderBottom: '2px solid var(--navy)', marginBottom: '8px', paddingBottom: '24px' }}></div>
                <p style={{ fontWeight: '700', color: 'var(--navy)' }}>{rx.doctor?.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--gray-600)' }}>{rx.doctor?.specialty}</p>
                <p style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{rx.doctor?.qualification}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetail;
