import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DoctorDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/doctors/${id}`),
      axios.get(`/api/reviews/doctor/${id}`)
    ]).then(([docRes, reviewRes]) => {
      setDoctor(docRes.data);
      setReviews(reviewRes.data);
    }).catch(() => navigate('/doctors'))
      .finally(() => setLoading(false));
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmittingReview(true);
    try {
      const res = await axios.post('/api/reviews', { doctorId: id, ...reviewForm });
      setReviews([res.data, ...reviews]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted! Thank you.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!doctor) return null;

  const initials = doctor.name?.split(' ').slice(0, 2).map(n => n[0]).join('');

  return (
    <div className="doctor-detail">
      <div className="doctor-detail-hero">
        <div className="container">
          <div className="doctor-detail-content">
            <div className="doctor-detail-avatar">{initials}</div>
            <div>
              <Link to="/doctors" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>← Back to Doctors</Link>
              <h1 style={{ color: 'white', fontSize: '38px', marginBottom: '8px' }}>{doctor.name}</h1>
              <div className="doctor-tags">
                <span className="tag">{doctor.specialty}</span>
                <span className="tag">{doctor.qualification}</span>
                {doctor.department && <span className="tag">{doctor.department}</span>}
              </div>
              <div className="info-grid">
                <div className="info-box">
                  <div className="info-box-value">{doctor.experience}+</div>
                  <div className="info-box-label">Years Exp.</div>
                </div>
                <div className="info-box">
                  <div className="info-box-value">⭐ {doctor.rating}</div>
                  <div className="info-box-label">{doctor.totalReviews} Reviews</div>
                </div>
                <div className="info-box">
                  <div className="info-box-value">₹{doctor.consultationFee}</div>
                  <div className="info-box-label">Consult Fee</div>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => user ? navigate(`/book/${doctor._id}`) : navigate('/login')}>📅 Book Appointment</button>
            </div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
            <div>
              {/* Bio */}
              <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '32px', border: '1px solid var(--gray-200)', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', color: 'var(--navy)', marginBottom: '16px' }}>About Dr. {doctor.name?.split(' ').slice(-1)}</h2>
                <p style={{ color: 'var(--gray-600)', lineHeight: '1.8' }}>{doctor.bio || 'Experienced and dedicated specialist committed to the highest quality patient care.'}</p>
              </div>

              {/* Availability */}
              <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '32px', border: '1px solid var(--gray-200)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '20px' }}>Available Days</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
                    <span key={day} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', background: doctor.availableDays?.includes(day) ? 'rgba(10,147,150,0.1)' : 'var(--gray-100)', color: doctor.availableDays?.includes(day) ? 'var(--teal)' : 'var(--gray-400)', border: `2px solid ${doctor.availableDays?.includes(day) ? 'var(--teal-light)' : 'transparent'}` }}>
                      {day.slice(0, 3)}
                    </span>
                  ))}
                </div>
                <h4 style={{ fontSize: '16px', color: 'var(--navy)', marginBottom: '12px' }}>Time Slots</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {doctor.availableSlots?.map(slot => (
                    <span key={slot} style={{ padding: '6px 14px', background: 'rgba(10,147,150,0.08)', color: 'var(--teal-dark)', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>{slot}</span>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '32px', border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '22px', color: 'var(--navy)' }}>Patient Reviews ({reviews.length})</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '28px', color: '#f59e0b', fontWeight: '700' }}>⭐ {doctor.rating}</span>
                    <span style={{ color: 'var(--gray-400)', fontSize: '14px' }}>/ 5.0</span>
                  </div>
                </div>

                {/* Write Review */}
                {user && (
                  <form onSubmit={submitReview} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '24px', marginBottom: '28px', border: '1px solid var(--gray-200)' }}>
                    <h4 style={{ fontSize: '16px', color: 'var(--navy)', marginBottom: '16px' }}>Write a Review</h4>
                    <div className="form-group">
                      <label>Rating</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[1,2,3,4,5].map(r => (
                          <button key={r} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: r })}
                            style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: r <= reviewForm.rating ? '#f59e0b' : 'var(--gray-200)', transition: 'var(--transition)' }}>★</button>
                        ))}
                        <span style={{ color: 'var(--gray-400)', fontSize: '14px', alignSelf: 'center', marginLeft: '8px' }}>{reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Your Review</label>
                      <textarea className="form-control" rows="3" placeholder="Share your experience with this doctor..." value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} required style={{ minHeight: '80px' }} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>{submittingReview ? 'Submitting...' : '⭐ Submit Review'}</button>
                  </form>
                )}

                {reviews.length === 0 ? (
                  <div className="empty-state" style={{ padding: '40px' }}>
                    <div className="icon">⭐</div>
                    <h3>No reviews yet</h3>
                    <p>Be the first to review Dr. {doctor.name?.split(' ').slice(-1)}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reviews.map(review => (
                      <div key={review._id} style={{ padding: '20px', border: '1px solid var(--gray-200)', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '38px', height: '38px', background: 'var(--teal)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px' }}>{review.patient?.name?.charAt(0)}</div>
                            <div>
                              <p style={{ fontWeight: '600', color: 'var(--navy)', fontSize: '15px' }}>{review.patient?.name}</p>
                              <div style={{ color: '#f59e0b', fontSize: '14px' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--gray-600)', lineHeight: '1.6' }}>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '28px', border: '1px solid var(--gray-200)', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--navy)', marginBottom: '16px' }}>Contact Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {doctor.phone && <div style={{ display: 'flex', gap: '10px', fontSize: '14px', color: 'var(--gray-600)' }}>📞 {doctor.phone}</div>}
                  <div style={{ display: 'flex', gap: '10px', fontSize: '14px', color: 'var(--gray-600)' }}>✉️ {doctor.email}</div>
                  {doctor.department && <div style={{ display: 'flex', gap: '10px', fontSize: '14px', color: 'var(--gray-600)' }}>🏥 {doctor.department}</div>}
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))', borderRadius: 'var(--radius)', padding: '28px', color: 'white', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
                <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '8px' }}>Book a Consultation</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '20px' }}>Consultation fee: <strong>₹{doctor.consultationFee}</strong></p>
                <button className="btn btn-white" style={{ width: '100%', justifyContent: 'center' }} onClick={() => user ? navigate(`/book/${doctor._id}`) : navigate('/login')}>Book Now</button>
                {!user && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '10px' }}>Login required to book</p>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DoctorDetail;
