const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// GET /api/admin/logs/stats/overview
router.get('/stats/overview', async (req, res) => {
  try {
    const [total, failures, byAction, byEntity, byRole] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ status: 'failure' }),
      AuditLog.aggregate([{ $group: { _id: '$action', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      AuditLog.aggregate([{ $group: { _id: '$entityType', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AuditLog.aggregate([{ $group: { _id: '$actorRole', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ]);
    return res.json({ total, failures, byAction, byEntity, byRole });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/logs
router.get('/', async (req, res) => {
  try {
    const {
      actorRole,
      action,
      entityType,
      status,
      from,
      to,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};
    if (actorRole) query.actorRole = actorRole;
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (status) query.status = status;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .populate('actorUser', 'name email role')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.json({
      logs,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/logs/:id
router.get('/:id', async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate('actorUser', 'name email role');
    if (!log) return res.status(404).json({ message: 'Log not found' });
    return res.json(log);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

