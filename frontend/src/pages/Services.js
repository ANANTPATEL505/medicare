import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const serviceIcons = {
  emergency: '🚑', cardiology: '❤️', neurology: '🧠', orthopedics: '🦴',
  pediatrics: '👶', oncology: '🎗️', dermatology: '🌿', ophthalmology: '👁️'
};

const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    axios.get('/api/services').then(res => setServices(res.data));
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>Our Medical Services</h1>
        <p>Comprehensive healthcare services delivered by expert specialists with state-of-the-art facilities.</p>
      </div>

      <section className="section">
        <div className="container">
          <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{serviceIcons[service.icon] || '🏥'}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="service-features" style={{ marginTop: '20px' }}>
                  {service.features?.map(f => (
                    <div key={f} className="feature-item">{f}</div>
                  ))}
                </div>
                <Link
                  to={`/doctors?specialty=${service.title}`}
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: '20px', justifyContent: 'center', display: 'flex' }}
                >
                  View {service.title} Doctors →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)', padding: '60px 0', textAlign: 'center', color: 'white' }}>
        <div className="container">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚑</div>
          <h2 style={{ fontSize: '36px', marginBottom: '16px' }}>24/7 Emergency Services</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            Our emergency department is always ready. In a medical emergency, don't hesitate — call us immediately.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="tel:+15559110000" className="btn btn-white btn-lg">📞 Call Emergency: +1 (555) 911-0000</a>
            <Link to="/contact" className="btn btn-lg" style={{ border: '2px solid rgba(255,255,255,0.5)', color: 'white' }}>Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
