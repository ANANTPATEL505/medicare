import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '' });
  const [password, setPassword] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const updateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/auth/profile', { name: profile.name, phone: profile.phone });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (password.newPass !== password.confirm) { toast.error('Passwords do not match'); return; }
    if (password.newPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await axios.put('/api/auth/change-password', { currentPassword: password.current, newPassword: password.newPass });
      toast.success('Password changed successfully!');
      setPassword({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="dashboard-header">
          <div>
            <h1>Profile Settings ⚙️</h1>
            <p>Manage your account information and preferences</p>
          </div>
        </div>

        {/* Avatar card */}
        <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', fontWeight: '700', flexShrink: 0 }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontSize: '22px', color: 'var(--navy)' }}>{user?.name}</h3>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>{user?.email}</p>
            <span style={{ background: 'rgba(10,147,150,0.1)', color: 'var(--teal)', padding: '3px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>{user?.role}</span>
          </div>
        </div>

        <div className="tabs">
          {['profile', 'password', 'preferences'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <form onSubmit={updateProfile} style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '32px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '24px' }}>Personal Information</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-control" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-control" value={profile.email} disabled style={{ background: 'var(--gray-50)', cursor: 'not-allowed' }} />
              <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>Email cannot be changed for security reasons</p>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" className="form-control" placeholder="+91 XXXXX XXXXX" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={updatePassword} style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '32px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '24px' }}>Change Password</h3>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" className="form-control" placeholder="Enter current password" value={password.current} onChange={e => setPassword({ ...password, current: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" className="form-control" placeholder="Min. 6 characters" value={password.newPass} onChange={e => setPassword({ ...password, newPass: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" className="form-control" placeholder="Repeat new password" value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'Updating...' : '🔒 Update Password'}
            </button>
          </form>
        )}

        {tab === 'preferences' && (
          <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '32px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '24px' }}>Notification Preferences</h3>
            {[
              { label: 'Appointment Reminders', desc: 'Get notified 24 hours before your appointment', defaultOn: true },
              { label: 'Prescription Updates', desc: 'Notify when new prescriptions are added', defaultOn: true },
              { label: 'Health Tips & Blog', desc: 'Receive weekly health articles and tips', defaultOn: false },
              { label: 'Promotional Offers', desc: 'Special health packages and discounts', defaultOn: false },
            ].map((pref, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < 3 ? '1px solid var(--gray-100)' : 'none' }}>
                <div>
                  <p style={{ fontWeight: '600', color: 'var(--gray-800)', marginBottom: '2px' }}>{pref.label}</p>
                  <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{pref.desc}</p>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0 }}>
                  <input type="checkbox" defaultChecked={pref.defaultOn} style={{ opacity: 0, width: 0, height: 0 }}
                    onChange={() => toast.success('Preference saved')} />
                  <span style={{ position: 'absolute', inset: 0, background: pref.defaultOn ? 'var(--teal)' : 'var(--gray-200)', borderRadius: '50px', transition: 'var(--transition)' }}>
                    <span style={{ position: 'absolute', left: pref.defaultOn ? '22px' : '2px', top: '2px', width: '22px', height: '22px', background: 'white', borderRadius: '50%', transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' }}></span>
                  </span>
                </label>
              </div>
            ))}
            <button className="btn btn-primary" style={{ marginTop: '24px', justifyContent: 'center', width: '100%' }} onClick={() => toast.success('Preferences saved!')}>Save Preferences</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
