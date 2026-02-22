import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
const urgencyColors = {
  low: '#2a9d8f',
  medium: '#e9c46a',
  high: '#e76f51',
  emergency: '#e63946',
};

const TriageAssistant = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    symptomsText: '',
    age: '',
    sex: '',
    chronicConditions: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.symptomsText.trim()) {
      toast.error('Please describe your symptoms');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        symptomsText: form.symptomsText,
        age: form.age ? Number(form.age) : undefined,
        sex: form.sex || undefined,
        chronicConditions: form.chronicConditions
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
      };
      const res = await axios.post('/api/triage/analyze', payload);
      setResult(res.data);
      if(user && res.data?.triageSessionId) {
        toast.success('AI response saved to your panel');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div className="dashboard-header">
          <div>
            <h1>AI Symptom Checker</h1>
            <p>Describe your symptoms to get doctor specialty guidance and safe next steps.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="table-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '22px', color: 'var(--navy)', marginBottom: '16px' }}>Tell us your problem</h3>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Symptoms *</label>
                <textarea
                  className="form-control"
                  rows="7"
                  placeholder="Example: chest pain, shortness of breath, dizziness..."
                  value={form.symptomsText}
                  onChange={(e) => setForm({ ...form, symptomsText: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    max="130"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Sex</label>
                  <select className="form-control" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
                    <option value="">Prefer not to say</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Chronic Conditions (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.chronicConditions}
                  placeholder="hypertension, diabetes"
                  onChange={(e) => setForm({ ...form, chronicConditions: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Analyzing...' : 'Analyze Symptoms'}
              </button>
            </form>
          </div>

          <div className="table-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '22px', color: 'var(--navy)', marginBottom: '16px' }}>Guidance</h3>
            {!result ? (
              <div className="empty-state" style={{ padding: '40px 10px' }}>
                <div className="icon">🧠</div>
                <h3>No analysis yet</h3>
                <p>Submit symptoms to see recommended specialties and advice.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '14px', borderRadius: '10px', background: `${urgencyColors[result.urgencyLevel] || '#ddd'}20`, border: `1px solid ${urgencyColors[result.urgencyLevel] || '#ddd'}` }}>
                  <p style={{ fontSize: '12px', color: 'var(--gray-400)', textTransform: 'uppercase' }}>Urgency</p>
                  <p style={{ fontWeight: '700', color: urgencyColors[result.urgencyLevel] || 'var(--gray-600)' }}>
                    {(result.urgencyLevel || 'low').toUpperCase()}
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginTop: '4px' }}>{result.nextStep}</p>
                </div>

                {result.redFlags?.length > 0 && (
                  <div style={{ background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.3)', borderRadius: '10px', padding: '12px' }}>
                    <p style={{ fontWeight: '700', color: 'var(--red)', marginBottom: '8px' }}>Red Flags</p>
                    {result.redFlags.map((flag) => (
                      <p key={flag} style={{ fontSize: '13px', color: '#7f1d1d' }}>• {flag}</p>
                    ))}
                  </div>
                )}

                <div>
                  <p style={{ fontWeight: '700', color: 'var(--navy)', marginBottom: '8px' }}>Recommended specialties</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(result.recommendedSpecialties || []).map((rec) => (
                      <button
                        key={`${rec.specialty}-${rec.confidence}`}
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ justifyContent: 'space-between' }}
                        onClick={() => navigate(`/doctors?specialty=${encodeURIComponent(rec.specialty)}`)}
                      >
                        <span>{rec.specialty}</span>
                        <span>{Math.round((rec.confidence || 0) * 100)}%</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontWeight: '700', color: 'var(--navy)', marginBottom: '8px' }}>Advice</p>
                  {(result.advice || []).map((item) => (
                    <p key={item} style={{ fontSize: '14px', color: 'var(--gray-600)' }}>• {item}</p>
                  ))}
                </div>

                <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: '10px', padding: '10px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{result.disclaimer}</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link to="/doctors" className="btn btn-primary btn-sm">Browse Doctors</Link>
                  {user  && <Link to="/patient/triage" className="btn btn-outline btn-sm">View Saved Responses</Link>}
                  <Link to="/contact" className="btn btn-outline btn-sm">Contact Hospital</Link>
                </div>

                
                {!user &&(
                  <div style={{ background:'rgba(2,62,138,0.08)',border:'1px solid rgba(2,62,138,0.2)',borderRadius:'10px',padding:'10px'}}>
                    <p style={{ fontSize:'12px', color:'#1e3a8a'}}>
                      Sign in to save this AI response in your patient panel.
                    </p>

                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriageAssistant;

