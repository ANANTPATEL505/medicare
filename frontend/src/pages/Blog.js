import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const categoryColors = {
  'Health Tips': '#0a9396', 'Nutrition': '#2a9d8f', 'Mental Health': '#7b2d8b',
  'Fitness': '#e76f51', 'Disease Prevention': '#e9c46a', 'Medical News': '#264653', 'Research': '#023e8a'
};

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ['All', 'Health Tips', 'Nutrition', 'Mental Health', 'Fitness', 'Disease Prevention', 'Medical News', 'Research'];

  useEffect(() => {
    axios.get('/api/blogs?featured=true&limit=3').then(res => setFeatured(res.data.blogs || []));
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [category, page]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      const res = await axios.get(`/api/blogs?${params}`);
      setBlogs(res.data.blogs || []);
      setTotalPages(res.data.pages || 1);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="page-header">
        <h1>Health & Wellness Blog</h1>
        <p>Expert articles, health tips, and medical insights from our team of specialists.</p>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section style={{ background: 'var(--gray-50)', padding: '60px 0' }}>
          <div className="container">
            <div className="section-tag" style={{ marginBottom: '24px' }}>Featured Articles</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {featured.map(blog => (
                <Link key={blog._id} to={`/blog/${blog.slug}`} style={{ background: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--gray-200)', display: 'block', transition: 'var(--transition)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ height: '10px', background: `linear-gradient(90deg, ${categoryColors[blog.category] || 'var(--teal)'}, var(--teal-dark))` }}></div>
                  <div style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ background: `${categoryColors[blog.category]}20`, color: categoryColors[blog.category] || 'var(--teal)', padding: '3px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' }}>{blog.category}</span>
                      <span style={{ color: 'var(--gray-400)', fontSize: '12px', padding: '3px 0' }}>⭐ Featured</span>
                    </div>
                    <h3 style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '12px', lineHeight: '1.3' }}>{blog.title}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--gray-600)', lineHeight: '1.7', marginBottom: '16px' }}>{blog.excerpt}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-800)' }}>{blog.author}</p>
                        <p style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{blog.authorRole}</p>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--gray-400)' }}>
                        <p>⏱ {blog.readTime} min read</p>
                        <p>👁 {blog.views?.toLocaleString()} views</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
            <form onSubmit={e => { e.preventDefault(); setPage(1); fetchBlogs(); }} style={{ display: 'flex', gap: '10px', flex: 1 }}>
              <input type="text" className="search-input" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} onClick={() => { setCategory(c); setPage(1); }}
                style={{ padding: '6px 16px', borderRadius: '50px', fontSize: '13px', fontWeight: '600', border: '2px solid', borderColor: category === c ? 'var(--teal)' : 'var(--gray-200)', background: category === c ? 'var(--teal)' : 'white', color: category === c ? 'white' : 'var(--gray-600)', cursor: 'pointer', transition: 'var(--transition)' }}>
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-screen" style={{ minHeight: '300px' }}><div className="spinner"></div></div>
          ) : blogs.length === 0 ? (
            <div className="empty-state"><div className="icon">📰</div><h3>No articles found</h3></div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {blogs.map(blog => (
                  <Link key={blog._id} to={`/blog/${blog.slug}`}
                    style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', overflow: 'hidden', display: 'block', transition: 'var(--transition)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ height: '6px', background: `linear-gradient(90deg, ${categoryColors[blog.category] || 'var(--teal)'}, var(--teal))` }}></div>
                    <div style={{ padding: '24px' }}>
                      <span style={{ background: `${categoryColors[blog.category]}18`, color: categoryColors[blog.category] || 'var(--teal)', padding: '3px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' }}>{blog.category}</span>
                      <h3 style={{ fontSize: '18px', color: 'var(--navy)', margin: '12px 0 10px', lineHeight: '1.3' }}>{blog.title}</h3>
                      <p style={{ fontSize: '14px', color: 'var(--gray-600)', lineHeight: '1.6', marginBottom: '16px' }}>{blog.excerpt.slice(0, 120)}...</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--gray-100)' }}>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-800)' }}>{blog.author}</p>
                          <p style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{new Date(blog.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span style={{ color: 'var(--teal)', fontWeight: '600', fontSize: '13px' }}>⏱ {blog.readTime} min</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i + 1} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Blog;
