import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Health Tips','Nutrition','Mental Health','Fitness','Disease Prevention','Medical News','Research'];

const emptyForm = { title:'', excerpt:'', content:'', category:'Health Tips', author:'', authorRole:'Medical Expert', tags:'', readTime:5, isFeatured:false, isPublished:true };

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/blogs/admin/all');
      setBlogs(res.data);
    } finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (blog) => {
    setEditing(blog._id);
    setForm({ ...blog, tags: blog.tags?.join(', ') || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), readTime: Number(form.readTime) };
    try {
      if (editing) {
        await axios.put(`/api/blogs/${editing}`, payload);
        toast.success('Article updated!');
      } else {
        await axios.post('/api/blogs', payload);
        toast.success('Article published!');
      }
      setShowModal(false);
      fetchBlogs();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving article'); }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try { await axios.delete(`/api/blogs/${id}`); toast.success('Article deleted'); fetchBlogs(); }
    catch { toast.error('Failed to delete'); }
  };

  const togglePublish = async (blog) => {
    try {
      await axios.put(`/api/blogs/${blog._id}`, { ...blog, isPublished: !blog.isPublished });
      toast.success(blog.isPublished ? 'Article unpublished' : 'Article published');
      fetchBlogs();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Blog Management 📰</h1>
            <p>Create and manage health articles</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ New Article</button>
        </div>

        <div className="table-card">
          <div className="table-header"><h3>All Articles ({blogs.length})</h3></div>
          {loading ? <div style={{ padding: '60px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
            : blogs.length === 0 ? <div className="empty-state"><div className="icon">📰</div><h3>No articles yet</h3><button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={openAdd}>Write First Article</button></div>
            : (
              <table className="data-table">
                <thead><tr><th>Title</th><th>Category</th><th>Author</th><th>Views</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {blogs.map(blog => (
                    <tr key={blog._id}>
                      <td>
                        <strong style={{ color: 'var(--navy)' }}>{blog.title}</strong>
                        {blog.isFeatured && <span style={{ marginLeft: '8px', background: 'rgba(233,196,106,0.2)', color: '#92400e', padding: '2px 8px', borderRadius: '50px', fontSize: '11px' }}>★ Featured</span>}
                      </td>
                      <td><span style={{ background: 'rgba(10,147,150,0.1)', color: 'var(--teal-dark)', padding: '3px 10px', borderRadius: '50px', fontSize: '12px' }}>{blog.category}</span></td>
                      <td style={{ fontSize: '14px' }}>{blog.author}</td>
                      <td style={{ fontWeight: '600' }}>{blog.views?.toLocaleString()}</td>
                      <td><span style={{ background: blog.isPublished ? 'rgba(42,157,143,0.1)' : 'var(--gray-100)', color: blog.isPublished ? 'var(--green)' : 'var(--gray-400)', padding: '3px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' }}>{blog.isPublished ? 'Published' : 'Draft'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => openEdit(blog)} className="btn btn-outline btn-sm">✏️</button>
                          <button onClick={() => togglePublish(blog)} className="btn btn-sm" style={{ background: blog.isPublished ? 'rgba(233,196,106,0.1)' : 'rgba(10,147,150,0.1)', color: blog.isPublished ? '#92400e' : 'var(--teal)', border: 'none' }}>{blog.isPublished ? '📵' : '✅'}</button>
                          <button onClick={() => deleteBlog(blog._id)} className="btn btn-danger btn-sm">🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Article' : 'New Article'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Title *</label><input type="text" className="form-control" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="form-group"><label>Excerpt *</label><textarea className="form-control" rows="2" required value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} /></div>
              <div className="form-group">
                <label>Content * <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>(HTML supported: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;)</span></label>
                <textarea className="form-control" rows="10" required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="<h2>Heading</h2><p>Your content...</p>" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Read Time (min)</label><input type="number" className="form-control" min="1" value={form.readTime} onChange={e => setForm({ ...form, readTime: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Author *</label><input type="text" className="form-control" required value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
                <div className="form-group"><label>Author Role</label><input type="text" className="form-control" value={form.authorRole} onChange={e => setForm({ ...form, authorRole: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Tags (comma separated)</label><input type="text" className="form-control" placeholder="heart health, lifestyle, prevention" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                  <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} />
                  Publish immediately
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />
                  Mark as Featured
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{editing ? 'Update Article' : 'Publish Article'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
