import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const urgencyColors = {
  low: '#2a9d8f',
  medium: '#e9c46a',
  high: '#e76f51',
  emergency: '#e63946',
};

const TriageHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/triage/my')
      .then((res) => setSessions(res.data || []))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load AI responses'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>AI Responses History</h1>
            <p>Saved symptom analyses and recommendations from the AI checker.</p>
          </div>
          <Link to="/ai-triage" className="btn btn-primary">New AI Check</Link>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🧠</div>
            <h3>No AI responses saved yet</h3>
            <p>Run an AI symptom check while logged in to save response history.</p>
            <Link to="/ai-triage" className="btn btn-outline" style={{ marginTop: '16px' }}>Open AI Symptom Checker</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {sessions.map((s) => (
              <div key={s._id} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
                    {new Date(s.createdAt).toLocaleString()}
                  </span>
                  <span style={{ background: `${urgencyColors[s.urgencyLevel] || '#ddd'}20`, color: urgencyColors[s.urgencyLevel] || 'var(--gray-600)', border: `1px solid ${urgencyColors[s.urgencyLevel] || '#ddd'}`, borderRadius: '999px', padding: '3px 10px', fontSize: '12px', fontWeight: 700 }}>
                    {(s.urgencyLevel || 'low').toUpperCase()}
                  </span>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--gray-700)', marginBottom: '12px' }}>
                  <strong>Symptoms:</strong> {s.symptomsText}
                </p>

                {s.recommendedSpecialties?.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>Recommended Specialists</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {s.recommendedSpecialties.map((rec, idx) => (
                        <Link
                          key={`${rec.specialty}-${idx}`}
                          to={`/doctors?specialty=${encodeURIComponent(rec.specialty)}`}
                          style={{ fontSize: '12px', color: 'var(--teal-dark)', background: 'rgba(10,147,150,0.08)', padding: '4px 8px', borderRadius: '999px' }}
                        >
                          {rec.specialty}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {s.advice?.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)' }}>Advice</p>
                    {s.advice.slice(0, 3).map((a, idx) => (
                      <p key={idx} style={{ fontSize: '13px', color: 'var(--gray-600)' }}>• {a}</p>
                    ))}
                  </div>
                )}

                {s.redFlags?.length > 0 && (
                  <div style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.25)', borderRadius: '8px', padding: '8px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--red)', marginBottom: '4px' }}>Red Flags</p>
                    {s.redFlags.slice(0, 2).map((f, idx) => (
                      <p key={idx} style={{ fontSize: '12px', color: '#7f1d1d' }}>• {f}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TriageHistory;

