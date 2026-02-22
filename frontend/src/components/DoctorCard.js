import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DoctorCard = ({ doctor }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initials = doctor.name?.split(' ').slice(0, 2).map(n => n[0]).join('');

  const handleBook = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/book/${doctor._id}`);
    }
  };

  return (
    <div className="doctor-card fade-up">
      <div className="doctor-card-top">
        <div className="doctor-avatar">{initials}</div>
        <h3>{doctor.name}</h3>
        <span className="doctor-specialty">{doctor.specialty}</span>
      </div>
      <div className="doctor-card-body">
        <div className="doctor-meta">
          <div className="meta-item">
            <div className="meta-value">{doctor.experience}+</div>
            <div className="meta-label">Years Exp.</div>
          </div>
          <div className="meta-item">
            <div className="meta-value">
              <span className="rating">⭐ {doctor.rating}</span>
            </div>
            <div className="meta-label">{doctor.totalReviews} Reviews</div>
          </div>
          <div className="meta-item">
            <div className="meta-value">₹{doctor.consultationFee}</div>
            <div className="meta-label">Consult Fee</div>
          </div>
        </div>
        <div className="doctor-card-actions">
          <Link to={`/doctors/${doctor._id}`} className="btn btn-outline btn-sm">View Profile</Link>
          <button onClick={handleBook} className="btn btn-primary btn-sm">Book Now</button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
