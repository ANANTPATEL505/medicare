import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const DoctorPatients = () => {
  const [links, setLinks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/doctor/patients')
      .then((res) => setLinks(res.data || []))
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = links.filter((item) => {
    const p = item.patient || {};
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.phone?.toLowerCase().includes(q);
  });

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>My Patients</h1>
            <p>Patients assigned to your doctor account.</p>
          </div>
        </div>

        <div className="filters-bar">
          <input className="search-input" placeholder="Search by patient name/email/phone" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="table-card">
          <div className="table-header"><h3>Patient Registry</h3></div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="icon">👥</div><h3>No patients assigned</h3></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Source</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td><strong>{item.patient?.name}</strong></td>
                    <td>{item.patient?.email}</td>
                    <td>{item.patient?.phone || 'N/A'}</td>
                    <td>{item.source}</td>
                    <td style={{ maxWidth: '220px' }}>{item.notes || 'No notes'}</td>
                    <td>
                      <Link className="btn btn-outline btn-sm" to={`/doctor/patients/${item.patient?._id}`}>Open</Link>
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

export default DoctorPatients;

