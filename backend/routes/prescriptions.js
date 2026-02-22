const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');
const Doctor = require('../models/Doctor');
const { protect, adminOnly } = require('../middleware/auth');
const { logAudit } = require('../services/auditService');

const canAccessPrescription = async (rx, user) => {
  if (!rx || !user) return false;
  if (user.role === 'admin') return true;
  const patientId = rx.patient?._id ? rx.patient._id.toString() : rx.patient?.toString();
  if (patientId === user._id.toString()) return true;
  if (user.role === 'doctor') {
    const doctorId = rx.doctor?._id ? rx.doctor._id : rx.doctor;
    const doctor = await Doctor.findById(doctorId).select('user');
    return !!doctor && doctor.user?.toString() === user._id.toString();
  }
  return false;
};

// GET /api/prescriptions/my
router.get('/my', protect, async (req, res) => {
  try {
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id }).select('_id');
      if (!doctor) return res.json([]);
      const prescriptions = await Prescription.find({ doctor: doctor._id })
        .populate('patient', 'name email phone')
        .populate('appointment', 'date timeSlot')
        .sort({ createdAt: -1 });
      return res.json(prescriptions);
    }

    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate('doctor', 'name specialty')
      .populate('appointment', 'date timeSlot')
      .sort({ createdAt: -1 });
    return res.json(prescriptions);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/prescriptions/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const rx = await Prescription.findById(req.params.id)
      .populate('doctor', 'name specialty qualification phone user')
      .populate('patient', 'name email phone')
      .populate('appointment', 'date timeSlot');
    if (!rx) return res.status(404).json({ message: 'Prescription not found' });

    const allowed = await canAccessPrescription(rx, req.user);
    if (!allowed) return res.status(403).json({ message: 'Not authorized to view this prescription' });

    return res.json(rx);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/prescriptions - admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, diagnosis, medicines, labTests, advice, followUpDate } = req.body;
    const rx = await Prescription.create({
      patient: patientId,
      doctor: doctorId,
      appointment: appointmentId || null,
      diagnosis,
      medicines,
      labTests,
      advice,
      followUpDate,
    });

    await Notification.create({
      user: patientId,
      title: 'New Prescription Available',
      message: 'A new prescription has been added for you. Check your health records.',
      type: 'prescription',
      link: '/patient/prescriptions',
    });

    await logAudit(req, {
      action: 'prescription.create',
      entityType: 'prescription',
      entityId: rx._id,
      status: 'success',
      after: { patient: patientId, doctor: doctorId },
    });

    const populated = await rx.populate([
      { path: 'doctor', select: 'name specialty' },
      { path: 'patient', select: 'name email' },
    ]);
    return res.status(201).json(populated);
  } catch (err) {
    await logAudit(req, {
      action: 'prescription.create',
      entityType: 'prescription',
      status: 'failure',
      reason: err.message,
    });
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/prescriptions - all (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const rxs = await Prescription.find()
      .populate('doctor', 'name specialty')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });
    return res.json(rxs);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

