import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const DoctorPatientDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/doctor/patients/${id}`);
      setData(res.data);
      setNotes(res.data?.link?.notes || '');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const saveNotes = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/doctor/patients/${id}/notes`, { notes });
      toast.success('Notes updated');
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!data) return <div className="dashboard"><div className="container"><div className="empty-state"><div className="icon">❌</div><h3>Patient not found</h3></div></div></div>;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>{data.link?.patient?.name}</h1>
            <p>{data.link?.patient?.email} • {data.link?.patient?.phone || 'No phone'}</p>
          </div>
          <Link to="/doctor/patients" className="btn btn-outline">Back to Patients</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="table-card" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '10px' }}>Doctor Notes</h3>
            <textarea className="form-control" rows="7" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={saveNotes} disabled={saving}>
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>

          <div className="table-card" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '12px' }}>Summary</h3>
            <p><strong>Appointments:</strong> {data.appointments?.length || 0}</p>
            <p><strong>Prescriptions:</strong> {data.prescriptions?.length || 0}</p>
            <p><strong>Assignment Source:</strong> {data.link?.source}</p>
            <p><strong>Assigned On:</strong> {new Date(data.link?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="table-card" style={{ marginTop: '20px' }}>
          <div className="table-header"><h3>Appointments</h3></div>
          {data.appointments?.length ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Symptoms</th>
                </tr>
              </thead>
              <tbody>
                {data.appointments.map((apt) => (
                  <tr key={apt._id}>
                    <td>{new Date(apt.date).toLocaleDateString()}</td>
                    <td>{apt.timeSlot}</td>
                    <td><span className={`badge badge-${apt.status}`}>{apt.status}</span></td>
                    <td>{apt.symptoms || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="empty-state"><h3>No appointments</h3></div>}
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientDetail;

