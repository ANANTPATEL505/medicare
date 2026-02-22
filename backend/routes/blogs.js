const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { protect, adminOnly } = require('../middleware/auth');
const { logAudit } = require('../services/auditService');

// GET /api/blogs/admin/all (admin - includes unpublished)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.json(blogs);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/blogs
router.get('/', async (req, res) => {
  try {
    const { category, featured, page = 1, limit = 9, search } = req.query;
    const query = { isPublished: true };
    if (category && category !== 'All') query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    return res.json({ blogs, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/blogs/:slug
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ message: 'Article not found' });
    return res.json(blog);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/blogs - admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    await logAudit(req, {
      action: 'blog.create',
      entityType: 'blog',
      entityId: blog._id,
      status: 'success',
      after: { title: blog.title, isPublished: blog.isPublished },
    });
    return res.status(201).json(blog);
  } catch (err) {
    await logAudit(req, { action: 'blog.create', entityType: 'blog', status: 'failure', reason: err.message });
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/blogs/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const before = await Blog.findById(req.params.id);
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    await logAudit(req, {
      action: 'blog.update',
      entityType: 'blog',
      entityId: blog._id,
      status: 'success',
      before,
      after: blog,
    });
    return res.json(blog);
  } catch (err) {
    await logAudit(req, { action: 'blog.update', entityType: 'blog', entityId: req.params.id, status: 'failure', reason: err.message });
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/blogs/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    await logAudit(req, {
      action: 'blog.delete',
      entityType: 'blog',
      entityId: req.params.id,
      status: 'success',
    });
    return res.json({ message: 'Blog deleted' });
  } catch (err) {
    await logAudit(req, { action: 'blog.delete', entityType: 'blog', entityId: req.params.id, status: 'failure', reason: err.message });
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

