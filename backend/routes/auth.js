const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { logAudit } = require('../services/auditService');

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await logAudit(req, { action: 'auth.register', entityType: 'user', entityId: existingUser._id, status: 'failure', reason: 'duplicate_email' });
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password, phone, role: 'patient' });

    await logAudit(req, {
      action: 'auth.register',
      entityType: 'user',
      entityId: user._id,
      status: 'success',
      after: { role: user.role, email: user.email },
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    await logAudit(req, { action: 'auth.register', entityType: 'user', status: 'failure', reason: error.message });
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      await logAudit(req, {
        action: 'auth.login',
        entityType: 'user',
        status: 'failure',
        reason: 'invalid_credentials',
        after: { email },
      });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await logAudit(req, {
      action: 'auth.login',
      entityType: 'user',
      entityId: user._id,
      status: 'success',
      after: { role: user.role, email: user.email },
    });

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    await logAudit(req, { action: 'auth.login', entityType: 'user', status: 'failure', reason: error.message });
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    return res.json(req.user);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const before = { name: req.user.name, phone: req.user.phone || '' };
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true }
    ).select('-password');

    await logAudit(req, {
      action: 'auth.profile.update',
      entityType: 'user',
      entityId: req.user._id,
      status: 'success',
      before,
      after: { name: user.name, phone: user.phone || '' },
    });
    return res.json(user);
  } catch (error) {
    await logAudit(req, { action: 'auth.profile.update', entityType: 'user', entityId: req.user?._id, status: 'failure', reason: error.message });
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      await logAudit(req, {
        action: 'auth.password.change',
        entityType: 'user',
        entityId: req.user._id,
        status: 'failure',
        reason: 'current_password_incorrect',
      });
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    await logAudit(req, {
      action: 'auth.password.change',
      entityType: 'user',
      entityId: req.user._id,
      status: 'success',
    });
    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    await logAudit(req, {
      action: 'auth.password.change',
      entityType: 'user',
      entityId: req.user?._id,
      status: 'failure',
      reason: error.message,
    });
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
