import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/blogs/${slug}`)
      .then(res => {
        setBlog(res.data);
        return axios.get(`/api/blogs?category=${res.data.category}&limit=3`);
      })
      .then(res => setRelated(res.data.blogs?.filter(b => b.slug !== slug).slice(0, 2) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!blog) return <div className="empty-state" style={{ paddingTop: '120px' }}><div className="icon">📰</div><h3>Article not found</h3><Link to="/blog" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Blog</Link></div>;

  return (
    <div style={{ paddingTop: '100px' }}>
      {/* Article Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--teal-dark))', padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <Link to="/blog" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>← Back to Blog</Link>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--teal-light)', padding: '4px 16px', borderRadius: '50px', fontSize: '13px', fontWeight: '600', marginBottom: '20px', display: 'inline-block' }}>{blog.category}</span>
          <h1 style={{ color: 'white', fontSize: 'clamp(26px, 4vw, 42px)', lineHeight: '1.2', marginBottom: '20px' }}>{blog.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '17px', lineHeight: '1.7', marginBottom: '32px' }}>{blog.excerpt}</p>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, var(--teal), var(--teal-light))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px' }}>{blog.author?.charAt(0)}</div>
              <div>
                <p style={{ color: 'white', fontWeight: '600' }}>{blog.author}</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{blog.authorRole}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
              <span>📅 {new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>⏱ {blog.readTime} min read</span>
              <span>👁 {blog.views?.toLocaleString()} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container" style={{ maxWidth: '860px', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '48px' }}>
          <div>
            <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '48px', fontSize: '16px', lineHeight: '1.8', color: 'var(--gray-700)' }}
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <p style={{ fontWeight: '600', color: 'var(--navy)', marginBottom: '12px' }}>Tags:</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {blog.tags.map(tag => (
                    <span key={tag} style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', padding: '4px 14px', borderRadius: '50px', fontSize: '13px' }}>#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '24px', marginBottom: '24px', position: 'sticky', top: '100px' }}>
              <h4 style={{ fontSize: '18px', color: 'var(--navy)', marginBottom: '16px' }}>About the Author</h4>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '700', margin: '0 auto 12px' }}>{blog.author?.charAt(0)}</div>
                <p style={{ fontWeight: '700', color: 'var(--navy)' }}>{blog.author}</p>
                <p style={{ fontSize: '13px', color: 'var(--teal)' }}>{blog.authorRole}</p>
              </div>
              <Link to="/doctors" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Book Appointment</Link>
            </div>

            {related.length > 0 && (
              <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '24px' }}>
                <h4 style={{ fontSize: '18px', color: 'var(--navy)', marginBottom: '16px' }}>Related Articles</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {related.map(r => (
                    <Link key={r._id} to={`/blog/${r.slug}`} style={{ display: 'block', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', border: '1px solid var(--gray-200)', transition: 'var(--transition)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal-light)'; e.currentTarget.style.background = 'rgba(10,147,150,0.04)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = 'var(--gray-50)'; }}>
                      <p style={{ fontWeight: '600', color: 'var(--navy)', fontSize: '14px', marginBottom: '4px', lineHeight: '1.3' }}>{r.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--teal)' }}>⏱ {r.readTime} min read</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
