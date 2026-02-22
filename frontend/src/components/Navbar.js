import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const getHomeByRole = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'doctor') return '/doctor';
  return '/dashboard';
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const dropRef = useRef();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      axios.get('/api/notifications/my').then((res) => setUnread(res.data.unread || 0)).catch(() => {});
    } else {
      setUnread(0);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="logo">
          <div className="logo-icon">+</div>
          Medi<span>Care</span>
        </Link>

        <ul className="nav-links">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/doctors">Doctors</NavLink></li>
          <li><NavLink to="/services">Services</NavLink></li>
          <li><NavLink to="/ai-triage">AI Symptom Checker</NavLink></li>
          <li><NavLink to="/blog">Health Blog</NavLink></li>
          <li><NavLink to="/contact">Contact</NavLink></li>
        </ul>

        <div className="nav-actions">
          {user ? (
            <>
              {(user.role === 'patient' || user.role === 'admin') && (
                <Link to="/patient/notifications" style={{ position: 'relative', padding: '8px', display: 'flex', alignItems: 'center', color: 'var(--gray-600)' }}>
                  🔔
                  {unread > 0 && (
                    <span style={{ position: 'absolute', top: '2px', right: '2px', background: 'var(--red)', color: 'white', fontSize: '10px', fontWeight: '700', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread > 9 ? '9+' : unread}</span>
                  )}
                </Link>
              )}

              <div className="user-menu" ref={dropRef}>
                <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="user-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
                  {user.name?.split(' ')[0]}
                  <span>▾</span>
                </button>
                {dropdownOpen && (
                  <div className="dropdown">
                    <Link to={getHomeByRole(user.role)} onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                    <Link to="/ai-triage" onClick={() => setDropdownOpen(false)}>AI Symptom Checker</Link>

                    {user.role === 'patient' && (
                      <>
                        <Link to="/patient/prescriptions" onClick={() => setDropdownOpen(false)}>Prescriptions</Link>
                        <Link to="/patient/triage" onClick={() => setDropdownOpen(false)}>AI Responses</Link>
                        <Link to="/patient/history" onClick={() => setDropdownOpen(false)}>Medical History</Link>
                        <Link to="/patient/profile" onClick={() => setDropdownOpen(false)}>Profile Settings</Link>
                      </>
                    )}

                    {user.role === 'doctor' && (
                      <>
                        <Link to="/doctor/appointments" onClick={() => setDropdownOpen(false)}>My Appointments</Link>
                        <Link to="/doctor/patients" onClick={() => setDropdownOpen(false)}>My Patients</Link>
                        <Link to="/doctor/prescriptions" onClick={() => setDropdownOpen(false)}>My Prescriptions</Link>
                        <Link to="/patient/profile" onClick={() => setDropdownOpen(false)}>Account Settings</Link>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <>
                        <hr />
                        <Link to="/admin" onClick={() => setDropdownOpen(false)}>Admin Panel</Link>
                        <Link to="/admin/analytics" onClick={() => setDropdownOpen(false)}>Analytics</Link>
                        <Link to="/admin/logs" onClick={() => setDropdownOpen(false)}>Audit Logs</Link>
                      </>
                    )}

                    <hr />
                    <button onClick={handleLogout}>Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

