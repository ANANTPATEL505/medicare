const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const { protect, adminOnly } = require('../middleware/auth');
const { logAudit } = require('../services/auditService');

// GET /api/reviews/doctor/:doctorId
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate('patient', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, rating, comment, appointmentId } = req.body;
    if (!doctorId || !rating || !comment) {
      return res.status(400).json({ message: 'Doctor, rating and comment are required' });
    }
    const existing = await Review.findOne({ doctor: doctorId, patient: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this doctor' });
    }
    const review = await Review.create({
      doctor: doctorId,
      patient: req.user._id,
      appointment: appointmentId,
      rating,
      comment
    });

    // Update doctor's average rating
    const allReviews = await Review.find({ doctor: doctorId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Doctor.findByIdAndUpdate(doctorId, {
      rating: Math.round(avg * 10) / 10,
      totalReviews: allReviews.length
    });

    const populated = await review.populate('patient', 'name');
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You have already reviewed this doctor' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/reviews/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    await logAudit(req, {
      action: 'review.delete',
      entityType: 'review',
      entityId: req.params.id,
      status: 'success',
    });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    await logAudit(req, {
      action: 'review.delete',
      entityType: 'review',
      entityId: req.params.id,
      status: 'failure',
      reason: err.message,
    });
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
