import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/contact', form);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Contact Us</h1>
        <p>Get in touch with our team for any queries, appointments, or assistance.</p>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>We're Here to Help</h2>
              <p>
                Our dedicated support team is available 24/7 to assist you with appointments,
                medical queries, and any other assistance you may need.
              </p>
              <div className="contact-items">
                {[
                  { icon: '📍', title: 'Our Address', text: '123 Medical Center Drive\nNew York, NY 10001' },
                  { icon: '📞', title: 'Phone Numbers', text: 'General: +1 (555) 123-4567\nEmergency: +1 (555) 911-0000' },
                  { icon: '✉️', title: 'Email', text: 'General: info@medicare.com\nAppointments: book@medicare.com' },
                  { icon: '🕐', title: 'Working Hours', text: 'Mon-Fri: 8:00 AM - 8:00 PM\nWeekends: 9:00 AM - 5:00 PM\nEmergency: 24/7' },
                ].map(item => (
                  <div key={item.title} className="contact-item">
                    <div className="contact-item-icon">{item.icon}</div>
                    <div className="contact-item-text">
                      <strong>{item.title}</strong>
                      <p style={{ whiteSpace: 'pre-line' }}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="contact-form-card">
              {sent ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                  <h3 style={{ fontSize: '24px', color: 'var(--navy)', marginBottom: '12px' }}>Message Sent!</h3>
                  <p style={{ color: 'var(--gray-600)', marginBottom: '24px' }}>Thank you for reaching out. Our team will contact you within 24 hours.</p>
                  <button className="btn btn-primary" onClick={() => setSent(false)}>Send Another Message</button>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: '24px', color: 'var(--navy)', marginBottom: '24px' }}>Send us a Message</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input type="text" className="form-control" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input type="email" className="form-control" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="tel" className="form-control" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Subject *</label>
                      <select className="form-control" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required>
                        <option value="">Select a topic</option>
                        <option>Appointment Inquiry</option>
                        <option>Medical Records</option>
                        <option>Billing Question</option>
                        <option>Feedback & Suggestions</option>
                        <option>General Inquiry</option>
                        <option>Emergency</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Message *</label>
                      <textarea className="form-control" placeholder="Write your message here..." rows="5" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                      {loading ? 'Sending...' : '📨 Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <div style={{ background: 'var(--navy)', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '20px' }}>
        📍 Map — 123 Medical Center Drive, New York, NY 10001
      </div>
    </>
  );
};

export default Contact;
