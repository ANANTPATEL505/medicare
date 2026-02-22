import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/patients')
      .then(res => setPatients(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Patients 👥</h1>
            <p>All registered patients ({patients.length} total)</p>
          </div>
        </div>

        <div className="filters-bar">
          <input type="text" className="search-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="btn btn-sm btn-outline" onClick={() => setSearch('')}>Clear</button>}
        </div>

        <div className="table-card">
          <div className="table-header">
            <h3>Patient Registry</h3>
            <span style={{ fontSize: '14px', color: 'var(--gray-400)' }}>{filtered.length} patients</span>
          </div>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p._id}>
                    <td style={{ color: 'var(--gray-400)', fontSize: '13px' }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                          {p.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <strong>{p.name}</strong>
                      </div>
                    </td>
                    <td style={{ fontSize: '14px' }}>{p.email}</td>
                    <td style={{ fontSize: '14px' }}>{p.phone || '—'}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <span style={{ background: p.isActive ? 'rgba(42,157,143,0.1)' : 'rgba(230,57,70,0.1)', color: p.isActive ? 'var(--green)' : 'var(--red)', padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' }}>
                        {p.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
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

export default AdminPatients;
