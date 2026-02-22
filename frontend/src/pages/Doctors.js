import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorCard from '../components/DoctorCard';
import { useLocation } from 'react-router-dom';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const location = useLocation();

  const specialties = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Oncology', 'Dermatology', 'Ophthalmology'];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sp = params.get('specialty');
    if (sp) setSpecialty(sp);
  }, [location.search]);

  useEffect(() => {
    fetchDoctors();
  }, [specialty, page]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 8 });
      if (specialty) params.append('specialty', specialty);
      if (search) params.append('search', search);
      const res = await axios.get(`/api/doctors?${params}`);
      setDoctors(res.data.doctors || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  return (
    <>
      <div className="page-header">
        <h1>Find Your Doctor</h1>
        <p>Browse our roster of expert physicians and book your appointment today.</p>
      </div>

      <section className="section">
        <div className="container">
          <div className="filters-bar">
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or specialty..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>
            <div className="filter-group">
              <label>Specialty:</label>
              <select
                className="filter-select"
                value={specialty}
                onChange={e => { setSpecialty(e.target.value); setPage(1); }}
              >
                <option value="">All Specialties</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {specialty && (
              <button
                className="btn btn-sm"
                style={{ background: 'none', color: 'var(--teal)', border: '1px solid var(--teal)' }}
                onClick={() => { setSpecialty(''); setSearch(''); setPage(1); }}
              >
                ✕ Clear
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-screen" style={{ minHeight: '400px' }}>
              <div className="spinner"></div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🔍</div>
              <h3>No doctors found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              <div className="doctors-grid">
                {doctors.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >←</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                      onClick={() => setPage(i + 1)}
                    >{i + 1}</button>
                  ))}
                  <button
                    className="page-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >→</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Doctors;
