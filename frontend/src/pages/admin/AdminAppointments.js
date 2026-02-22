import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchAppointments(); }, [status, page]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (status) params.append('status', status);
      const res = await axios.get(`/api/appointments?${params}`);
      setAppointments(res.data.appointments || []);
      setTotal(res.data.total || 0);
    } finally { setLoading(false); }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/appointments/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchAppointments();
    } catch { toast.error('Failed to update'); }
  };

  const filtered = search ? appointments.filter(a =>
    a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    a.doctor?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.patientEmail?.toLowerCase().includes(search.toLowerCase())
  ) : appointments;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Appointments 📅</h1>
            <p>Manage all patient appointments ({total} total)</p>
          </div>
        </div>

        <div className="filters-bar">
          <input type="text" className="search-input" placeholder="Search patient or doctor..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="filter-group">
            <label>Status:</label>
            <select className="filter-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {(search || status) && <button className="btn btn-sm btn-outline" onClick={() => { setSearch(''); setStatus(''); setPage(1); }}>Clear</button>}
        </div>

        <div className="table-card">
          <div className="table-header">
            <h3>All Appointments</h3>
            <span style={{ fontSize: '14px', color: 'var(--gray-400)' }}>{filtered.length} results</span>
          </div>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="icon">📅</div><h3>No appointments found</h3></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Contact</th>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Date & Time</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(apt => (
                    <tr key={apt._id}>
                      <td><strong style={{ color: 'var(--navy)' }}>{apt.patientName}</strong></td>
                      <td style={{ fontSize: '13px' }}>
                        <div>{apt.patientEmail}</div>
                        <div style={{ color: 'var(--gray-400)' }}>{apt.patientPhone}</div>
                      </td>
                      <td>{apt.doctor?.name}</td>
                      <td><span style={{ background: 'rgba(10,147,150,0.1)', color: 'var(--teal)', padding: '2px 8px', borderRadius: '50px', fontSize: '12px' }}>{apt.doctor?.specialty}</span></td>
                      <td>
                        <div>{new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div style={{ color: 'var(--gray-400)', fontSize: '13px' }}>🕐 {apt.timeSlot}</div>
                      </td>
                      <td>₹{apt.fee}</td>
                      <td><span className={`badge badge-${apt.status}`}>{apt.status}</span></td>
                      <td>
                        <select value={apt.status} onChange={e => updateStatus(apt._id, e.target.value)}
                          style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--gray-200)', fontSize: '12px', cursor: 'pointer' }}>
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
            </div>
          )}
        </div>

        {/* Pagination */}
        {Math.ceil(total / 15) > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
            {Array.from({ length: Math.ceil(total / 15) }, (_, i) => (
              <button key={i + 1} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="page-btn" disabled={page === Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>→</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
