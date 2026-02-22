import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AdminSettings = () => {
  const [hospitalInfo, setHospitalInfo] = useState({
    name: 'MediCare Hospital', email: 'info@medicare.com', phone: '+1 (555) 123-4567',
    emergency: '+1 (555) 911-0000', address: '123 Medical Center Drive, New York, NY 10001',
    website: 'www.medicare.com', established: '1999', beds: '500', staff: '1200'
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => { toast.success('Settings saved!'); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="dashboard">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="dashboard-header">
          <div>
            <h1>System Settings ⚙️</h1>
            <p>Configure hospital information and system preferences</p>
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { icon: '👨‍⚕️', label: 'Manage Doctors', link: '/admin/doctors' },
            { icon: '📅', label: 'Appointments', link: '/admin/appointments' },
            { icon: '📊', label: 'Analytics', link: '/admin/analytics' },
            { icon: '🧾', label: 'Audit Logs', link: '/admin/logs' },
            { icon: '📰', label: 'Blog Articles', link: '/admin/blogs' },
            { icon: '💊', label: 'Prescriptions', link: '/admin/prescriptions' },
            { icon: '📬', label: 'Messages', link: '/admin/messages' },
          ].map(item => (
            <Link key={item.label} to={item.link} style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '20px', textAlign: 'center', display: 'block', transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--navy)' }}>{item.label}</p>
            </Link>
          ))}
        </div>

        {/* Hospital Info */}
        <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '32px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '24px' }}>🏥 Hospital Information</h3>
          <div className="form-row">
            <div className="form-group"><label>Hospital Name</label><input type="text" className="form-control" value={hospitalInfo.name} onChange={e => setHospitalInfo({ ...hospitalInfo, name: e.target.value })} /></div>
            <div className="form-group"><label>Website</label><input type="text" className="form-control" value={hospitalInfo.website} onChange={e => setHospitalInfo({ ...hospitalInfo, website: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Email</label><input type="email" className="form-control" value={hospitalInfo.email} onChange={e => setHospitalInfo({ ...hospitalInfo, email: e.target.value })} /></div>
            <div className="form-group"><label>Phone</label><input type="text" className="form-control" value={hospitalInfo.phone} onChange={e => setHospitalInfo({ ...hospitalInfo, phone: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Emergency Number</label><input type="text" className="form-control" value={hospitalInfo.emergency} onChange={e => setHospitalInfo({ ...hospitalInfo, emergency: e.target.value })} /></div>
            <div className="form-group"><label>Year Established</label><input type="text" className="form-control" value={hospitalInfo.established} onChange={e => setHospitalInfo({ ...hospitalInfo, established: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Full Address</label><input type="text" className="form-control" value={hospitalInfo.address} onChange={e => setHospitalInfo({ ...hospitalInfo, address: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label>Total Beds</label><input type="number" className="form-control" value={hospitalInfo.beds} onChange={e => setHospitalInfo({ ...hospitalInfo, beds: e.target.value })} /></div>
            <div className="form-group"><label>Total Staff</label><input type="number" className="form-control" value={hospitalInfo.staff} onChange={e => setHospitalInfo({ ...hospitalInfo, staff: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>{saved ? '✅ Saved!' : '💾 Save Settings'}</button>
        </div>

        {/* System Info */}
        <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '32px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '20px' }}>🖥️ System Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'System Version', value: 'MediCare v2.0.0' },
              { label: 'Backend', value: 'Node.js + Express.js' },
              { label: 'Database', value: 'MongoDB + Mongoose' },
              { label: 'Frontend', value: 'React 18' },
              { label: 'Auth', value: 'JWT + bcrypt' },
              { label: 'Environment', value: 'Development' },
            ].map(item => (
              <div key={item.label} style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '4px' }}>{item.label}</p>
                <p style={{ fontWeight: '600', color: 'var(--navy)', fontSize: '14px' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ background: 'rgba(230,57,70,0.03)', borderRadius: 'var(--radius)', border: '1px solid rgba(230,57,70,0.2)', padding: '32px' }}>
          <h3 style={{ fontSize: '20px', color: 'var(--red)', marginBottom: '20px' }}>⚠️ Danger Zone</h3>
          <p style={{ color: 'var(--gray-600)', marginBottom: '20px', fontSize: '14px' }}>These actions are irreversible. Please be absolutely sure before proceeding.</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-danger btn-sm" onClick={() => toast.error('This action is disabled in demo mode')}>🗑 Clear All Test Data</button>
            <button className="btn btn-sm" style={{ border: '1px solid var(--red)', color: 'var(--red)', background: 'none' }} onClick={() => toast.error('This action is disabled in demo mode')}>📤 Export All Data</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
