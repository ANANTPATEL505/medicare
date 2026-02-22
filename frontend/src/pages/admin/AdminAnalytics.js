import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const MiniBarChart = ({ data, color = 'var(--teal)', label }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value || d.count || 0));
  return (
    <div>
      {label && <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>{label}</p>}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '80px' }}>
        {data.map((d, i) => {
          const val = d.value || d.count || 0;
          const height = max > 0 ? (val / max) * 80 : 0;
          return (
            <div key={i} title={`${d.label || d.date || ''}: ${val}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '100%', height: `${Math.max(height, 2)}px`, background: color, borderRadius: '3px 3px 0 0', transition: 'height 0.5s ease', opacity: 0.85 }}></div>
              {d.label && <span style={{ fontSize: '10px', color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>{d.label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [specialtyStats, setSpecialtyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/analytics/overview'),
      axios.get('/api/analytics/specialty-stats')
    ]).then(([overviewRes, specialtyRes]) => {
      setData(overviewRes.data);
      setSpecialtyStats(specialtyRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!data) return null;

  const statusMap = {};
  data.statusBreakdown?.forEach(s => statusMap[s._id] = s.count);

  const dailyChartData = data.appointmentsByDay?.map(d => ({
    value: d.count,
    label: new Date(d.date).getDate()
  })) || [];

  const revenueChartData = data.revenueData?.map(d => ({
    value: d.revenue,
    label: monthNames[d._id.month - 1]
  })) || [];

  const patientGrowthData = data.patientGrowth?.map(d => ({
    value: d.count,
    label: monthNames[d._id.month - 1]
  })) || [];

  const totalRevenue = data.totals?.totalRevenue || 0;
  const growthPct = data.monthStats?.lastMonthAppointments > 0
    ? Math.round(((data.monthStats?.monthAppointments - data.monthStats?.lastMonthAppointments) / data.monthStats?.lastMonthAppointments) * 100)
    : 0;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Analytics & Reports 📊</h1>
            <p>Real-time insights across all hospital operations</p>
          </div>
          <Link to="/admin" className="btn btn-outline">← Back to Dashboard</Link>
        </div>

        {/* KPI Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {[
            { icon: '👥', label: 'Total Patients', value: data.totals.totalPatients, sub: `+${data.monthStats.newPatientsThisMonth} this month`, cls: 'teal' },
            { icon: '👨‍⚕️', label: 'Doctors', value: data.totals.totalDoctors, sub: 'Active specialists', cls: 'navy' },
            { icon: '📋', label: 'Total Appointments', value: data.totals.totalAppointments, sub: `${data.monthStats.monthAppointments} this month`, cls: 'gold' },
            { icon: '💰', label: 'Total Revenue', value: `₹${(totalRevenue).toLocaleString()}`, sub: 'From completed visits', cls: 'teal' },
            { icon: '📈', label: 'Monthly Growth', value: `${growthPct >= 0 ? '+' : ''}${growthPct}%`, sub: 'vs last month', cls: growthPct >= 0 ? 'teal' : 'red' },
            { icon: '⏳', label: 'Pending Today', value: statusMap['pending'] || 0, sub: 'Awaiting confirmation', cls: 'red' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`stat-card-icon ${s.cls}`}>{s.icon}</div>
              <div className="stat-card-info">
                <div className="stat-card-value" style={{ fontSize: '22px' }}>{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '2px' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Daily Appointments */}
          <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--navy)', marginBottom: '8px' }}>Daily Appointments</h3>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '20px' }}>Last 14 days</p>
            <MiniBarChart data={dailyChartData} color="var(--teal)" />
          </div>

          {/* Revenue */}
          <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--navy)', marginBottom: '8px' }}>Monthly Revenue</h3>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '20px' }}>Last 6 months</p>
            <MiniBarChart data={revenueChartData} color="var(--gold)" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Patient Growth */}
          <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--navy)', marginBottom: '8px' }}>New Patient Registrations</h3>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '20px' }}>Monthly growth</p>
            <MiniBarChart data={patientGrowthData} color="#7b2d8b" />
          </div>

          {/* Appointment Status Pie-style */}
          <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--navy)', marginBottom: '24px' }}>Appointment Status Breakdown</h3>
            {[
              { label: 'Completed', key: 'completed', color: 'var(--teal)' },
              { label: 'Confirmed', key: 'confirmed', color: '#264653' },
              { label: 'Pending', key: 'pending', color: 'var(--gold)' },
              { label: 'Cancelled', key: 'cancelled', color: 'var(--red)' },
            ].map(s => {
              const count = statusMap[s.key] || 0;
              const pct = data.totals.totalAppointments > 0 ? Math.round((count / data.totals.totalAppointments) * 100) : 0;
              return (
                <div key={s.key} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{s.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: s.color }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--gray-100)', borderRadius: '50px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: '50px', transition: 'width 1s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Doctors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--navy)', marginBottom: '20px' }}>Top Doctors by Appointments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.topDoctors?.map((doc, i) => (
                <div key={doc._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                  <div style={{ width: '28px', height: '28px', background: i === 0 ? '#f59e0b' : i === 1 ? 'var(--gray-400)' : '#cd7f32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--navy)' }}>{doc.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{doc.specialty}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '700', color: 'var(--teal)', fontSize: '14px' }}>{doc.count} visits</p>
                    <p style={{ fontSize: '12px', color: 'var(--gray-400)' }}>₹{doc.revenue?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {(!data.topDoctors || data.topDoctors.length === 0) && <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '20px' }}>No completed appointments yet</p>}
            </div>
          </div>

          {/* Specialty Breakdown */}
          <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--navy)', marginBottom: '20px' }}>Appointments by Specialty</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {specialtyStats.slice(0, 6).map((s, i) => {
                const colors = ['var(--teal)', 'var(--navy)', '#7b2d8b', '#e76f51', '#264653', 'var(--gold)'];
                const maxCount = specialtyStats[0]?.count || 1;
                return (
                  <div key={s._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                      <span style={{ fontWeight: '500' }}>{s._id}</span>
                      <span style={{ fontWeight: '700', color: colors[i % colors.length] }}>{s.count}</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--gray-100)', borderRadius: '50px' }}>
                      <div style={{ height: '100%', width: `${(s.count / maxCount) * 100}%`, background: colors[i % colors.length], borderRadius: '50px' }}></div>
                    </div>
                  </div>
                );
              })}
              {specialtyStats.length === 0 && <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '20px' }}>No data yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
