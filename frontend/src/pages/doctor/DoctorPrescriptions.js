import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const emptyMedicine = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

const DoctorPrescriptions = () => {
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    patientId: '',
    diagnosis: '',
    medicines: [{ ...emptyMedicine }],
    labTests: '',
    advice: '',
    followUpDate: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [patientRes, prescriptionRes] = await Promise.all([
        axios.get('/api/doctor/patients'),
        axios.get('/api/doctor/prescriptions'),
      ]);
      setPatients(patientRes.data || []);
      setPrescriptions(prescriptionRes.data || []);
    } catch (error) {
      toast.error('Failed to load doctor prescription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateMedicine = (index, key, value) => {
    const meds = [...form.medicines];
    meds[index][key] = value;
    setForm({ ...form, medicines: meds });
  };

  const submitPrescription = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/doctor/prescriptions', {
        patientId: form.patientId,
        diagnosis: form.diagnosis,
        medicines: form.medicines,
        labTests: form.labTests.split(',').map((v) => v.trim()).filter(Boolean),
        advice: form.advice,
        followUpDate: form.followUpDate || null,
      });
      toast.success('Prescription created');
      setForm({
        patientId: '',
        diagnosis: '',
        medicines: [{ ...emptyMedicine }],
        labTests: '',
        advice: '',
        followUpDate: '',
      });
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Doctor Prescriptions</h1>
            <p>Create prescriptions for your assigned patients and monitor history.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="table-card" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '14px' }}>Create Prescription</h3>
            <form onSubmit={submitPrescription}>
              <div className="form-group">
                <label>Patient</label>
                <select className="form-control" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p.patient?._id}>{p.patient?.name} - {p.patient?.email}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Diagnosis</label>
                <input className="form-control" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} required />
              </div>

              {form.medicines.map((med, index) => (
                <div key={index} style={{ border: '1px solid var(--gray-200)', borderRadius: '10px', padding: '10px', marginBottom: '10px' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Medicine</label>
                      <input className="form-control" value={med.name} onChange={(e) => updateMedicine(index, 'name', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Dosage</label>
                      <input className="form-control" value={med.dosage} onChange={(e) => updateMedicine(index, 'dosage', e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Frequency</label>
                      <input className="form-control" value={med.frequency} onChange={(e) => updateMedicine(index, 'frequency', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Duration</label>
                      <input className="form-control" value={med.duration} onChange={(e) => updateMedicine(index, 'duration', e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Instructions</label>
                    <input className="form-control" value={med.instructions} onChange={(e) => updateMedicine(index, 'instructions', e.target.value)} />
                  </div>
                </div>
              ))}

              <button type="button" className="btn btn-outline btn-sm" onClick={() => setForm({ ...form, medicines: [...form.medicines, { ...emptyMedicine }] })}>
                Add Medicine
              </button>

              <div className="form-group" style={{ marginTop: '10px' }}>
                <label>Lab Tests (comma separated)</label>
                <input className="form-control" value={form.labTests} onChange={(e) => setForm({ ...form, labTests: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Advice</label>
                <textarea className="form-control" rows="3" value={form.advice} onChange={(e) => setForm({ ...form, advice: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Follow-up Date</label>
                <input type="date" className="form-control" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
              </div>
              <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Create Prescription'}</button>
            </form>
          </div>

          <div className="table-card">
            <div className="table-header"><h3>Recent Prescriptions</h3></div>
            {prescriptions.length === 0 ? (
              <div className="empty-state"><div className="icon">💊</div><h3>No prescriptions yet</h3></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Diagnosis</th>
                    <th>Date</th>
                    <th>Meds</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.slice(0, 10).map((rx) => (
                    <tr key={rx._id}>
                      <td>{rx.patient?.name}</td>
                      <td>{rx.diagnosis}</td>
                      <td>{new Date(rx.createdAt).toLocaleDateString()}</td>
                      <td>{rx.medicines?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPrescriptions;

