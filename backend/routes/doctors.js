const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { protect, adminOnly, optionalProtect } = require('../middleware/auth');
const { generateTemporaryPassword } = require('../services/passwordService');
const { logAudit } = require('../services/auditService');

// @route GET /api/doctors
router.get('/', optionalProtect, async (req, res) => {
  try {
    const { specialty, search, page = 1, limit = 12, includeInactive = 'false' } = req.query;
    const query = {};

    const isAdminRequest = req.user?.role === 'admin';
    if (!(isAdminRequest && includeInactive === 'true')) {
      query.isAvailable = true;
      query.isActive = true;
    }

    if (specialty && specialty !== 'All') query.specialty = specialty;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ rating: -1 });

    return res.json({ doctors, total, pages: Math.ceil(total / Number(limit)), currentPage: Number(page) });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route GET /api/doctors/specialties
router.get('/specialties', async (req, res) => {
  try {
    const specialties = await Doctor.distinct('specialty', { isActive: true });
    return res.json(specialties);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route POST /api/doctors
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      email,
      specialty,
      qualification,
      experience,
      bio,
      phone,
      consultationFee,
      department,
      availableDays,
      availableSlots,
      isAvailable = true,
      isActive = true,
    } = req.body;

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) return res.status(400).json({ message: 'Doctor already exists with this email' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'A user already exists with this doctor email' });

    const tempPassword = generateTemporaryPassword();
    const doctorUser = await User.create({
      name,
      email,
      password: tempPassword,
      phone,
      role: 'doctor',
    });

    const doctor = await Doctor.create({
      user: doctorUser._id,
      name,
      email,
      specialty,
      qualification,
      experience,
      bio,
      phone,
      consultationFee,
      department,
      availableDays,
      availableSlots,
      isAvailable,
      isActive,
    });

    await logAudit(req, {
      action: 'doctor.create',
      entityType: 'doctor',
      entityId: doctor._id,
      status: 'success',
      after: { user: doctorUser._id, email, specialty },
    });

    return res.status(201).json({
      doctor,
      doctorAccount: {
        userId: doctorUser._id,
        email: doctorUser.email,
        temporaryPassword: tempPassword,
        mustChangePassword: true,
      },
    });
  } catch (error) {
    await logAudit(req, {
      action: 'doctor.create',
      entityType: 'doctor',
      status: 'failure',
      reason: error.message,
    });
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route PUT /api/doctors/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const before = doctor.toObject();

    const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updated?.user) {
      await User.findByIdAndUpdate(updated.user, {
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        isActive: updated.isActive !== false,
      });
    }
    await logAudit(req, {
      action: 'doctor.update',
      entityType: 'doctor',
      entityId: updated._id,
      status: 'success',
      before,
      after: updated.toObject(),
    });
    return res.json(updated);
  } catch (error) {
    await logAudit(req, {
      action: 'doctor.update',
      entityType: 'doctor',
      entityId: req.params.id,
      status: 'failure',
      reason: error.message,
    });
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route DELETE /api/doctors/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await Doctor.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(doctor.user);
    await logAudit(req, {
      action: 'doctor.delete',
      entityType: 'doctor',
      entityId: req.params.id,
      status: 'success',
    });
    return res.json({ message: 'Doctor removed' });
  } catch (error) {
    await logAudit(req, {
      action: 'doctor.delete',
      entityType: 'doctor',
      entityId: req.params.id,
      status: 'failure',
      reason: error.message,
    });
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
