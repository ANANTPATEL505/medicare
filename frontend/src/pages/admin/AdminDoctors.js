import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SPECIALTIES = ['Cardiology','Neurology','Pediatrics','Orthopedics','Oncology','Dermatology','Ophthalmology','General Medicine','Psychiatry','Endocrinology'];

const emptyForm = { name:'', email:'', specialty:'', qualification:'', experience:'', bio:'', phone:'', consultationFee:500, department:'', availableDays:['Monday','Tuesday','Wednesday','Thursday','Friday'], availableSlots:['09:00','10:00','11:00','14:00','15:00'], isActive:true, isAvailable:true };

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [createdAccount, setCreatedAccount] = useState(null);

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/doctors?limit=100&includeInactive=true');
      setDoctors(res.data.doctors || []);
    } finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (doc) => {
    setEditing(doc._id);
    setForm({ name: doc.name, email: doc.email, specialty: doc.specialty, qualification: doc.qualification, experience: doc.experience, bio: doc.bio || '', phone: doc.phone || '', consultationFee: doc.consultationFee, department: doc.department || '', availableDays: doc.availableDays || [], availableSlots: doc.availableSlots || [], isActive: doc.isActive !== false, isAvailable: doc.isAvailable !== false });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`/api/doctors/${editing}`, { ...form, experience: Number(form.experience) });
        toast.success('Doctor updated!');
        setCreatedAccount(null);
      } else {
        const res = await axios.post('/api/doctors', { ...form, experience: Number(form.experience) });
        setCreatedAccount(res.data?.doctorAccount || null);
        toast.success('Doctor added!');
      }
      setShowModal(false);
      fetchDoctors();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving doctor'); }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm('Delete this doctor? This action cannot be undone.')) return;
    try { await axios.delete(`/api/doctors/${id}`); toast.success('Doctor removed'); fetchDoctors(); }
    catch { toast.error('Failed to delete'); }
  };

  const toggleDay = (day) => {
    const days = form.availableDays.includes(day) ? form.availableDays.filter(d => d !== day) : [...form.availableDays, day];
    setForm({ ...form, availableDays: days });
  };

  const filtered = doctors.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpec = !filterSpecialty || d.specialty === filterSpecialty;
    return matchSearch && matchSpec;
  });

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Doctors Management 👨‍⚕️</h1>
            <p>Manage your medical staff and specialists</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add New Doctor</button>
        </div>

        {createdAccount && (
          <div style={{ background: 'rgba(10,147,150,0.08)', border: '1px solid rgba(10,147,150,0.25)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <p style={{ fontWeight: '700', color: 'var(--teal-dark)', marginBottom: '6px' }}>Doctor account created</p>
            <p style={{ fontSize: '14px' }}><strong>Email:</strong> {createdAccount.email}</p>
            <p style={{ fontSize: '14px' }}><strong>Temporary Password:</strong> {createdAccount.temporaryPassword}</p>
            <p style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Share this once with the doctor and ask them to change password immediately.</p>
          </div>
        )}

        {/* Filters */}
        <div className="filters-bar">
          <input type="text" className="search-input" placeholder="Search by name or specialty..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="filter-group">
            <label>Specialty:</label>
            <select className="filter-select" value={filterSpecialty} onChange={e => setFilterSpecialty(e.target.value)}>
              <option value="">All</option>
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {(search || filterSpecialty) && <button className="btn btn-sm btn-outline" onClick={() => { setSearch(''); setFilterSpecialty(''); }}>Clear</button>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {loading ? <div className="loading-screen" style={{ minHeight: '300px', gridColumn: '1 / -1' }}><div className="spinner"></div></div>
            : filtered.length === 0 ? <div className="empty-state" style={{ gridColumn: '1 / -1' }}><div className="icon">👨‍⚕️</div><h3>No doctors found</h3></div>
            : filtered.map(doc => (
              <div key={doc._id} style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--teal-dark))', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '20px', flexShrink: 0 }}>
                    {doc.name?.split(' ').filter(n => n !== 'Dr.').slice(0, 2).map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '4px' }}>{doc.name}</h4>
                    <span style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--teal-light)', padding: '2px 10px', borderRadius: '50px', fontSize: '12px' }}>{doc.specialty}</span>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px', textAlign: 'center' }}>
                    {[{ v: `${doc.experience}yr`, l: 'Exp.' }, { v: `⭐${doc.rating}`, l: 'Rating' }, { v: `₹${doc.consultationFee}`, l: 'Fee' }].map(item => (
                      <div key={item.l} style={{ background: 'var(--gray-50)', borderRadius: '8px', padding: '10px' }}>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--navy)' }}>{item.v}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{item.l}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '12px' }}>{doc.qualification}</p>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', background: doc.isActive !== false ? 'rgba(42,157,143,0.1)' : 'rgba(230,57,70,0.1)', color: doc.isActive !== false ? 'var(--green)' : 'var(--red)', padding: '3px 8px', borderRadius: '50px' }}>
                      {doc.isActive !== false ? 'Account Active' : 'Account Inactive'}
                    </span>
                    <span style={{ fontSize: '11px', background: doc.isAvailable !== false ? 'rgba(10,147,150,0.1)' : 'rgba(148,163,184,0.2)', color: doc.isAvailable !== false ? 'var(--teal-dark)' : 'var(--gray-600)', padding: '3px 8px', borderRadius: '50px' }}>
                      {doc.isAvailable !== false ? 'Bookable' : 'Not Bookable'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(doc)} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>✏️ Edit</button>
                    <button onClick={() => deleteDoctor(doc._id)} className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: 'center' }}>🗑 Delete</button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Full Name *</label><input type="text" className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="form-group"><label>Email *</label><input type="email" className="form-control" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Specialty *</label>
                  <select className="form-control" required value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}>
                    <option value="">Select</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Phone</label><input type="text" className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Qualification *</label><input type="text" className="form-control" required placeholder="e.g. MD, FACC - Harvard Medical School" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Experience (years) *</label><input type="number" className="form-control" required min="1" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} /></div>
                <div className="form-group"><label>Consultation Fee (₹)</label><input type="number" className="form-control" value={form.consultationFee} onChange={e => setForm({ ...form, consultationFee: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Department</label><input type="text" className="form-control" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
              <div className="form-row">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                  Doctor account active
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} />
                  Accepting appointments
                </label>
              </div>
              <div className="form-group">
                <label>Available Days</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '2px solid', borderColor: form.availableDays.includes(day) ? 'var(--teal)' : 'var(--gray-200)', background: form.availableDays.includes(day) ? 'var(--teal)' : 'white', color: form.availableDays.includes(day) ? 'white' : 'var(--gray-600)', cursor: 'pointer' }}>
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>Bio</label><textarea className="form-control" rows="2" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{editing ? 'Update Doctor' : 'Add Doctor'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
