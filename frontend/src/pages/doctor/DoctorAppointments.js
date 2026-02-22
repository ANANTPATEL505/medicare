import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      const res = await axios.get(`/api/doctor/appointments?${params.toString()}`);
      setAppointments(res.data.appointments || []);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/doctor/appointments/${id}/status`, { status });
      toast.success('Appointment updated');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>My Appointments</h1>
            <p>Update statuses for your assigned appointments only.</p>
          </div>
        </div>

        <div className="filters-bar">
          <div className="filter-group">
            <label>Status:</label>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="table-card">
          <div className="table-header"><h3>Appointments</h3></div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : appointments.length === 0 ? (
            <div className="empty-state"><div className="icon">📭</div><h3>No appointments found</h3></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Date</th>
                  <th>Symptoms</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt._id}>
                    <td>{apt.patientName}</td>
                    <td>{apt.patientEmail}<br /><span style={{ color: 'var(--gray-400)' }}>{apt.patientPhone}</span></td>
                    <td>{new Date(apt.date).toLocaleDateString()} {apt.timeSlot}</td>
                    <td>{apt.symptoms || 'N/A'}</td>
                    <td><span className={`badge badge-${apt.status}`}>{apt.status}</span></td>
                    <td>
                      <select
                        className="filter-select"
                        value={apt.status}
                        onChange={(e) => updateStatus(apt._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
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

export default DoctorAppointments;

