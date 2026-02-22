import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const emptyMed = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientId: '', doctorId: '', appointmentId: '', diagnosis: '', medicines: [{ ...emptyMed }], labTests: [''], advice: '', followUpDate: '' });

  useEffect(() => {
    Promise.all([
      axios.get('/api/prescriptions'),
      axios.get('/api/doctors?limit=100'),
      axios.get('/api/patients'),
      axios.get('/api/appointments?limit=100')
    ]).then(([rxRes, docRes, patRes, aptsRes]) => {
      setPrescriptions(rxRes.data);
      setDoctors(docRes.data.doctors || []);
      setPatients(patRes.data);
      setAppointments(aptsRes.data.appointments || []);
    }).finally(() => setLoading(false));
  }, []);

  const addMedicine = () => setForm({ ...form, medicines: [...form.medicines, { ...emptyMed }] });
  const removeMedicine = (i) => setForm({ ...form, medicines: form.medicines.filter((_, idx) => idx !== i) });
  const updateMed = (i, field, value) => {
    const meds = [...form.medicines];
    meds[i][field] = value;
    setForm({ ...form, medicines: meds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, labTests: form.labTests.filter(t => t.trim()) };
    try {
      await axios.post('/api/prescriptions', payload);
      toast.success('Prescription created successfully!');
      setShowModal(false);
      const res = await axios.get('/api/prescriptions');
      setPrescriptions(res.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create prescription'); }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Prescriptions 💊</h1>
            <p>Manage all patient prescriptions</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Prescription</button>
        </div>

        {loading ? <div className="loading-screen" style={{ minHeight: '400px' }}><div className="spinner"></div></div>
          : prescriptions.length === 0 ? (
            <div className="empty-state">
              <div className="icon">💊</div>
              <h3>No prescriptions yet</h3>
              <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setShowModal(true)}>Create First Prescription</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {prescriptions.map(rx => (
                <div key={rx._id} style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--teal-dark))', padding: '20px', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Rx #{rx._id?.slice(-6).toUpperCase()}</p>
                        <h3 style={{ color: 'white', fontSize: '17px' }}>{rx.diagnosis}</h3>
                      </div>
                      <span style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--teal-light)', padding: '3px 10px', borderRadius: '50px', fontSize: '12px' }}>{rx.medicines?.length} meds</span>
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: '3px' }}>Patient</p>
                        <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--navy)' }}>{rx.patient?.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{rx.patient?.email}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: '3px' }}>Doctor</p>
                        <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--navy)' }}>{rx.doctor?.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--teal)' }}>{rx.doctor?.specialty}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {rx.medicines?.slice(0, 3).map((m, i) => <span key={i} style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', padding: '3px 10px', borderRadius: '50px', fontSize: '12px' }}>{m.name}</span>)}
                      {rx.medicines?.length > 3 && <span style={{ color: 'var(--gray-400)', fontSize: '12px', alignSelf: 'center' }}>+{rx.medicines.length - 3}</span>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{new Date(rx.createdAt).toLocaleDateString()}</p>
                      <Link to={`/patient/prescriptions/${rx._id}`} className="btn btn-outline btn-sm">View Full</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '700px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>New Prescription</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Patient *</label>
                  <select className="form-control" required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name} - {p.email}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Doctor *</label>
                  <select className="form-control" required value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>{d.name} - {d.specialty}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Linked Appointment (optional)</label>
                <select className="form-control" value={form.appointmentId} onChange={e => setForm({ ...form, appointmentId: e.target.value })}>
                  <option value="">None</option>
                  {appointments.filter(a => a.status === 'completed').map(a => (
                    <option key={a._id} value={a._id}>{a.patientName} - {a.doctor?.name} - {new Date(a.date).toLocaleDateString()}</option>
                  ))}
                </select>
              </div>
              <div className="form-group"><label>Diagnosis *</label><input type="text" className="form-control" required value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} /></div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ margin: 0 }}>Medicines *</label>
                  <button type="button" className="btn btn-sm btn-outline" onClick={addMedicine}>+ Add Medicine</button>
                </div>
                {form.medicines.map((med, i) => (
                  <div key={i} style={{ border: '1px solid var(--gray-200)', borderRadius: '8px', padding: '16px', marginBottom: '12px', position: 'relative' }}>
                    {form.medicines.length > 1 && <button type="button" onClick={() => removeMedicine(i)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '16px' }}>×</button>}
                    <div className="form-row">
                      <div className="form-group" style={{ marginBottom: '10px' }}><input className="form-control" placeholder="Medicine Name *" required value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} /></div>
                      <div className="form-group" style={{ marginBottom: '10px' }}><input className="form-control" placeholder="Dosage (e.g. 500mg)" required value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group" style={{ marginBottom: '10px' }}><input className="form-control" placeholder="Frequency (e.g. Twice daily)" required value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} /></div>
                      <div className="form-group" style={{ marginBottom: '10px' }}><input className="form-control" placeholder="Duration (e.g. 7 days)" required value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} /></div>
                    </div>
                    <input className="form-control" placeholder="Special instructions (optional)" value={med.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)} />
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Lab Tests</label>
                {form.labTests.map((test, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input className="form-control" placeholder="e.g. Complete Blood Count (CBC)" value={test} onChange={e => { const t = [...form.labTests]; t[i] = e.target.value; setForm({ ...form, labTests: t }); }} />
                    {form.labTests.length > 1 && <button type="button" onClick={() => setForm({ ...form, labTests: form.labTests.filter((_, idx) => idx !== i) })} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '20px' }}>×</button>}
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-outline" onClick={() => setForm({ ...form, labTests: [...form.labTests, ''] })}>+ Add Test</button>
              </div>

              <div className="form-group"><label>Doctor's Advice</label><textarea className="form-control" rows="2" value={form.advice} onChange={e => setForm({ ...form, advice: e.target.value })} /></div>
              <div className="form-group"><label>Follow-up Date</label><input type="date" className="form-control" value={form.followUpDate} onChange={e => setForm({ ...form, followUpDate: e.target.value })} /></div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>✅ Create Prescription</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrescriptions;
