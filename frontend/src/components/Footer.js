import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo" style={{ marginBottom: 0 }}>
            <div className="logo-icon">✚</div>
            <span style={{ color: 'white' }}>Medi<span style={{ color: '#94d2bd' }}>Care</span></span>
          </div>
          <p>Your trusted healthcare partner, providing world-class medical services with compassionate care for over 25 years.</p>
          <div className="social-links">
            <a href="#" className="social-link">🐦</a>
            <a href="#" className="social-link">👥</a>
            <a href="#" className="social-link">📷</a>
            <a href="#" className="social-link">💼</a>
          </div>
        </div>
        <div>
          <div className="footer-title">Quick Links</div>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/doctors">Find Doctors</Link></li>
            <li><Link to="/services">Our Services</Link></li>
            <li><Link to="/blog">Health Blog</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-title">Patient Portal</div>
          <ul className="footer-links">
            <li><Link to="/dashboard">My Dashboard</Link></li>
            <li><Link to="/patient/prescriptions">My Prescriptions</Link></li>
            <li><Link to="/patient/history">Medical History</Link></li>
            <li><Link to="/patient/profile">Profile Settings</Link></li>
            <li><Link to="/register">Create Account</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-title">Contact</div>
          <div className="footer-contact">
            <span>📍 123 Medical Center Drive, NY 10001</span>
            <span>📞 +1 (555) 123-4567</span>
            <span>✉️ info@medicare.com</span>
            <span>🚑 Emergency: 24/7</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 MediCare Hospital. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
