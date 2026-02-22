const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const DoctorPatient = require('../models/DoctorPatient');
const { protect, adminOnly } = require('../middleware/auth');
const { logAudit } = require('../services/auditService');

const canAccessAppointment = async (appointment, user) => {
  if (!appointment || !user) return false;
  if (user.role === 'admin') return true;
  if (appointment.patient.toString() === user._id.toString()) return true;
  if (user.role === 'doctor') {
    const doctor = await Doctor.findById(appointment.doctor).select('user');
    return !!doctor && doctor.user?.toString() === user._id.toString();
  }
  return false;
};

// @route POST /api/appointments
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, date, timeSlot, symptoms, patientName, patientEmail, patientPhone, triageSessionId } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (!doctor.isActive) return res.status(400).json({ message: 'Doctor is inactive' });

    const existing = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (existing) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      triageSession: triageSessionId || null,
      patientName: patientName || req.user.name,
      patientEmail: patientEmail || req.user.email,
      patientPhone,
      date: new Date(date),
      timeSlot,
      symptoms,
      fee: doctor.consultationFee,
    });

    // Keep doctor-patient ownership map in sync.
    await DoctorPatient.findOneAndUpdate(
      { doctor: doctorId, patient: req.user._id },
      {
        doctor: doctorId,
        patient: req.user._id,
        assignedBy: req.user._id,
        source: 'appointment',
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await logAudit(req, {
      action: 'appointment.create',
      entityType: 'appointment',
      entityId: appointment._id,
      status: 'success',
      after: { doctor: doctorId, patient: req.user._id, status: appointment.status },
    });

    const populated = await appointment.populate('doctor');
    return res.status(201).json(populated);
  } catch (error) {
    await logAudit(req, { action: 'appointment.create', entityType: 'appointment', status: 'failure', reason: error.message });
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route GET /api/appointments/my
router.get('/my', protect, async (req, res) => {
  try {
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id }).select('_id');
      if (!doctor) return res.json([]);
      const appointments = await Appointment.find({ doctor: doctor._id })
        .populate('doctor')
        .populate('patient', 'name email phone')
        .sort({ date: -1 });
      return res.json(appointments);
    }

    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor')
      .sort({ date: -1 });
    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/appointments (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('doctor')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.json({ appointments, total });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route GET /api/appointments/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor')
      .populate('patient', 'name email phone');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const allowed = await canAccessAppointment(appointment, req.user);
    if (!allowed) return res.status(403).json({ message: 'Not authorized to view this appointment' });

    return res.json(appointment);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT /api/appointments/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    let authorized = req.user.role === 'admin';
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findById(appointment.doctor).select('user');
      authorized = !!doctor && doctor.user?.toString() === req.user._id.toString();
    }
    if (!authorized) {
      return res.status(403).json({ message: 'Not authorized to update appointment status' });
    }

    const before = { status: appointment.status, notes: appointment.notes || '' };
    appointment.status = status;
    appointment.notes = notes || appointment.notes;
    await appointment.save();

    await logAudit(req, {
      action: 'appointment.status.update',
      entityType: 'appointment',
      entityId: appointment._id,
      status: 'success',
      before,
      after: { status: appointment.status, notes: appointment.notes || '' },
    });

    const populated = await appointment.populate('doctor');
    return res.json(populated);
  } catch (error) {
    await logAudit(req, {
      action: 'appointment.status.update',
      entityType: 'appointment',
      entityId: req.params.id,
      status: 'failure',
      reason: error.message,
    });
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route DELETE /api/appointments/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patient.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await appointment.deleteOne();
    await logAudit(req, {
      action: 'appointment.delete',
      entityType: 'appointment',
      entityId: req.params.id,
      status: 'success',
    });
    return res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    await logAudit(req, {
      action: 'appointment.delete',
      entityType: 'appointment',
      entityId: req.params.id,
      status: 'failure',
      reason: error.message,
    });
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

