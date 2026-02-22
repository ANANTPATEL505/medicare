import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminAuditLogs = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    actorRole: '',
    action: '',
    entityType: '',
    status: '',
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 30 });
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });

      const [statsRes, logsRes] = await Promise.all([
        axios.get('/api/admin/logs/stats/overview'),
        axios.get(`/api/admin/logs?${params.toString()}`),
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data.logs || []);
      setTotal(logsRes.data.total || 0);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, filters.actorRole, filters.action, filters.entityType, filters.status]);

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Audit Logs</h1>
            <p>Main admin monitoring for all key system actions.</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon teal">🧾</div>
            <div className="stat-card-info"><div className="stat-card-value">{stats?.total || 0}</div><div className="stat-card-label">Total Logs</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon red">❌</div>
            <div className="stat-card-info"><div className="stat-card-value">{stats?.failures || 0}</div><div className="stat-card-label">Failures</div></div>
          </div>
        </div>

        <div className="filters-bar">
          <div className="filter-group">
            <label>Role</label>
            <select className="filter-select" value={filters.actorRole} onChange={(e) => setFilters({ ...filters, actorRole: e.target.value })}>
              <option value="">All</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select className="filter-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
            </select>
          </div>
          <input className="search-input" placeholder="Filter action (e.g. appointment.status.update)" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} />
          <input className="search-input" placeholder="Entity type (doctor, triage, ...)" value={filters.entityType} onChange={(e) => setFilters({ ...filters, entityType: e.target.value })} />
          <button className="btn btn-outline btn-sm" onClick={() => setFilters({ actorRole: '', action: '', entityType: '', status: '' })}>Clear</button>
        </div>

        <div className="table-card">
          <div className="table-header">
            <h3>Logs</h3>
            <span style={{ fontSize: '14px', color: 'var(--gray-400)' }}>{total} records</span>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : logs.length === 0 ? (
            <div className="empty-state"><div className="icon">📭</div><h3>No logs</h3></div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Actor</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Status</th>
                    <th>Request</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                      <td>{log.actorUser?.name || 'System'}</td>
                      <td>{log.actorRole}</td>
                      <td>{log.action}</td>
                      <td>{log.entityType} {log.entityId ? `(${String(log.entityId).slice(-6)})` : ''}</td>
                      <td>
                        <span style={{ color: log.status === 'failure' ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                          {log.status}
                        </span>
                      </td>
                      <td>{log.meta?.method} {log.meta?.route}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {Math.ceil(total / 30) > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>←</button>
            {Array.from({ length: Math.ceil(total / 30) }, (_, i) => (
              <button key={i + 1} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="page-btn" disabled={page === Math.ceil(total / 30)} onClick={() => setPage((p) => p + 1)}>→</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;

