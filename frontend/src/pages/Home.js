import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DoctorCard from '../components/DoctorCard';

const serviceIcons = {
  emergency: '🚑', cardiology: '❤️', neurology: '🧠', orthopedics: '🦴',
  pediatrics: '👶', oncology: '🎗️', dermatology: '🌿', ophthalmology: '👁️'
};

const testimonials = [
  { name: 'Anjali Mehta', title: 'Patient, Cardiology', text: 'The doctors at MediCare are outstanding. Dr. Johnson was incredibly thorough and caring during my treatment. I felt completely in safe hands.', stars: 5 },
  { name: 'Rahul Verma', title: 'Patient, Orthopedics', text: 'After my knee surgery, the follow-up care was exceptional. The entire team was supportive and the recovery process was smooth thanks to their guidance.', stars: 5 },
  { name: 'Priya Kapoor', title: 'Patient, Pediatrics', text: 'Dr. Rodriguez is phenomenal with children. My son actually looks forward to his checkups now! The clinic environment is welcoming and child-friendly.', stars: 5 },
];

const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/doctors?limit=4').then(res => setDoctors(res.data.doctors || []));
    axios.get('/api/services').then(res => setServices(res.data.slice(0, 4)));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/doctors${specialty ? `?specialty=${specialty}` : ''}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">🏆 Trusted by 50,000+ Patients</div>
            <h1>Your Health is Our <span>Priority</span></h1>
            <p className="hero-desc">
              World-class healthcare with compassionate doctors. Book appointments instantly,
              get expert consultations, and experience care like never before.
            </p>
            <div className="hero-actions">
              <Link to="/doctors" className="btn btn-primary btn-lg">Find a Doctor</Link>
              <Link to="/ai-triage" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>AI Symptom Checker</Link>
              <Link to="/services" className="btn btn-white btn-lg">Our Services</Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">200+</div>
                <div className="stat-label">Expert Doctors</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Happy Patients</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">25+</div>
                <div className="stat-label">Years Experience</div>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <h3>Book an Appointment</h3>
            <form className="quick-search" onSubmit={handleSearch}>
              <div className="search-field">
                <label>Department / Specialty</label>
                <select value={specialty} onChange={e => setSpecialty(e.target.value)}>
                  <option value="">All Specialties</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                🔍 Search Doctors
              </button>
            </form>
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(148,210,189,0.1)', borderRadius: '10px', border: '1px solid rgba(148,210,189,0.2)' }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', textAlign: 'center' }}>
                🚑 Emergency? Call <strong style={{ color: '#94d2bd' }}>+1 (555) 911-0000</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">What We Offer</div>
            <h2>Our Medical Services</h2>
            <p>Comprehensive healthcare across all medical specialties with state-of-the-art facilities.</p>
          </div>
          <div className="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{serviceIcons[service.icon] || '🏥'}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="service-features">
                  {service.features?.slice(0, 2).map(f => (
                    <div key={f} className="feature-item">{f}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/services" className="btn btn-outline">View All Services →</Link>
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Meet the Experts</div>
            <h2>Our Top Doctors</h2>
            <p>Highly qualified specialists dedicated to delivering exceptional patient care.</p>
          </div>
          <div className="doctors-grid">
            {doctors.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/doctors" className="btn btn-primary">Browse All Doctors →</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Why MediCare</div>
            <h2>Your Health Deserves the Best</h2>
          </div>
          <div className="why-grid">
            {[
              { icon: '🏆', title: 'Award-Winning Care', desc: 'Recognized as the #1 hospital in the region for patient satisfaction and clinical excellence.' },
              { icon: '⚡', title: 'Instant Booking', desc: 'Book appointments 24/7 online. Get confirmed slots within minutes.' },
              { icon: '🔬', title: 'Advanced Technology', desc: 'Cutting-edge diagnostic and treatment equipment for the most accurate results.' },
              { icon: '💙', title: 'Compassionate Team', desc: 'Every member of our staff is dedicated to making your experience comfortable and stress-free.' },
              { icon: '🔒', title: 'Secure & Private', desc: 'Your health information is protected with industry-leading security standards.' },
              { icon: '🌍', title: '24/7 Emergency', desc: 'Round-the-clock emergency services with rapid response times.' },
            ].map(item => (
              <div key={item.title} className="why-card">
                <div className="why-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Patient Stories</div>
            <h2>What Our Patients Say</h2>
            <p>Thousands of patients trust MediCare for their healthcare needs.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">{'⭐'.repeat(t.stars)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.name[0]}</div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-title">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Book Your Appointment?</h2>
          <p>Join thousands of patients who trust MediCare for their health and wellbeing.</p>
          <div className="cta-actions">
            <Link to="/doctors" className="btn btn-white btn-lg">Find a Doctor</Link>
            <Link to="/register" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>Create Free Account</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
