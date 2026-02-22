import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [form, setForm] = useState({
    patientName: user?.name || '',
    patientEmail: user?.email || '',
    patientPhone: user?.phone || '',
    date: '',
    symptoms: ''
  });

  useEffect(() => {
    axios.get(`/api/doctors/${doctorId}`)
      .then(res => setDoctor(res.data))
      .catch(() => navigate('/doctors'))
      .finally(() => setLoading(false));
  }, [doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) { toast.error('Please select a time slot'); return; }
    if (!form.date) { toast.error('Please select a date'); return; }
    if (!form.patientPhone) { toast.error('Please provide your phone number'); return; }

    setSubmitting(true);
    try {
      await axios.post('/api/appointments', {
        doctorId,
        ...form,
        timeSlot: selectedSlot
      });
      toast.success('Appointment booked successfully! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const initials = doctor?.name?.split(' ').slice(0, 2).map(n => n[0]).join('');

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="booking-page">
      <div className="page-header" style={{ padding: '100px 0 40px' }}>
        <h1>Book Appointment</h1>
        <p>Fill in the details below to schedule your consultation</p>
      </div>

      <div className="container">
        <div className="booking-layout">
          <div className="booking-card">
            <h2 style={{ fontSize: '26px', color: 'var(--navy)', marginBottom: '24px' }}>Appointment Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.patientName}
                    onChange={e => setForm({ ...form, patientName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.patientEmail}
                    onChange={e => setForm({ ...form, patientEmail: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 XXXXX XXXXX"
                    value={form.patientPhone}
                    onChange={e => setForm({ ...form, patientPhone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Preferred Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    min={today}
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Select Time Slot *</label>
                <div className="time-slots">
                  {(doctor?.availableSlots || []).map(slot => (
                    <button
                      key={slot}
                      type="button"
                      className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Symptoms / Reason for Visit</label>
                <textarea
                  className="form-control"
                  placeholder="Describe your symptoms or reason for the appointment..."
                  value={form.symptoms}
                  onChange={e => setForm({ ...form, symptoms: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
              >
                {submitting ? 'Booking...' : '✅ Confirm Appointment'}
              </button>
            </form>
          </div>

          {doctor && (
            <div className="doctor-summary-card">
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div className="doctor-avatar" style={{ width: '80px', height: '80px', fontSize: '28px', margin: '0 auto 16px' }}>
                  {initials}
                </div>
                <h3 style={{ color: 'var(--navy)', fontSize: '20px' }}>{doctor.name}</h3>
                <p style={{ color: 'var(--teal)', fontWeight: '600', fontSize: '14px' }}>{doctor.specialty}</p>
              </div>

              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '20px' }}>
                {[
                  { label: 'Qualification', value: doctor.qualification },
                  { label: 'Experience', value: `${doctor.experience} years` },
                  { label: 'Rating', value: `⭐ ${doctor.rating} (${doctor.totalReviews} reviews)` },
                  { label: 'Consultation Fee', value: `₹${doctor.consultationFee}`, highlight: true },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--gray-400)' }}>{item.label}</span>
                    <span style={{ fontWeight: '600', color: item.highlight ? 'var(--teal)' : 'var(--gray-800)' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {selectedSlot && form.date && (
                <div style={{ background: 'rgba(10,147,150,0.08)', borderRadius: '10px', padding: '16px', marginTop: '20px', border: '1px solid rgba(10,147,150,0.2)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--teal)', fontWeight: '600', marginBottom: '8px' }}>Selected Appointment</p>
                  <p style={{ fontSize: '14px', color: 'var(--gray-800)' }}>📅 {new Date(form.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p style={{ fontSize: '14px', color: 'var(--gray-800)' }}>⏰ {selectedSlot}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
