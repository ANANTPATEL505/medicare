const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const DoctorPatient = require('../models/DoctorPatient');
const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, doctorOrAdmin, requireDoctorProfile } = require('../middleware/auth');
const { logAudit } = require('../services/auditService');

const getDoctorForRequest = async (req) => {
  if (req.user.role === 'admin') {
    const requestedDoctorId = req.query.doctorId || req.body.doctorId || req.params.doctorId;
    if (requestedDoctorId) {
      const doctor = await Doctor.findById(requestedDoctorId);
      if (!doctor) return null;
      return doctor;
    }
    return null;
  }
  if (req.doctorProfile) return req.doctorProfile;
  const doctor = await Doctor.findOne({ user: req.user._id });
  return doctor || null;
};

const ensureDoctorPatientLink = async (doctorId, patientId, assignedBy) => {
  return DoctorPatient.findOneAndUpdate(
    { doctor: doctorId, patient: patientId },
    {
      doctor: doctorId,
      patient: patientId,
      assignedBy,
      source: 'appointment',
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

router.use(protect, doctorOrAdmin, requireDoctorProfile);

// GET /api/doctor/summary
router.get('/summary', async (req, res) => {
  try {
    const doctor = await getDoctorForRequest(req);
    if (!doctor) return res.status(400).json({ message: 'Doctor context is required' });

    const [totalAppointments, todayAppointments, pendingAppointments, totalPatients, totalPrescriptions] = await Promise.all([
      Appointment.countDocuments({ doctor: doctor._id }),
      Appointment.countDocuments({
        doctor: doctor._id,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      Appointment.countDocuments({ doctor: doctor._id, status: { $in: ['pending', 'confirmed'] } }),
      DoctorPatient.countDocuments({ doctor: doctor._id, isActive: true }),
      Prescription.countDocuments({ doctor: doctor._id }),
    ]);

    return res.json({
      doctor: { _id: doctor._id, name: doctor.name, specialty: doctor.specialty },
      stats: { totalAppointments, todayAppointments, pendingAppointments, totalPatients, totalPrescriptions },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/doctor/appointments
router.get('/appointments', async (req, res) => {
  try {
    const doctor = await getDoctorForRequest(req);
    if (!doctor) return res.status(400).json({ message: 'Doctor context is required' });
    const { status, page = 1, limit = 30 } = req.query;
    const query = { doctor: doctor._id };
    if (status) query.status = status;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .sort({ date: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.json({ appointments, total, page: Number(page) });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/doctor/appointments/:id/status
router.put('/appointments/:id/status', async (req, res) => {
  try {
    const doctor = await getDoctorForRequest(req);
    if (!doctor) return res.status(400).json({ message: 'Doctor context is required' });
    const { status, notes } = req.body;
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this appointment' });
    }

    const before = { status: appointment.status, notes: appointment.notes || '' };
    appointment.status = status;
    appointment.notes = notes || appointment.notes;
    await appointment.save();

    await ensureDoctorPatientLink(doctor._id, appointment.patient, req.user._id);

    await logAudit(req, {
      action: 'doctor.appointment.status.update',
      entityType: 'appointment',
      entityId: appointment._id,
      status: 'success',
      before,
      after: { status: appointment.status, notes: appointment.notes || '' },
    });

    return res.json(appointment);
  } catch (error) {
    await logAudit(req, {
      action: 'doctor.appointment.status.update',
      entityType: 'appointment',
      entityId: req.params.id,
      status: 'failure',
      reason: error.message,
    });
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/doctor/patients
router.get('/patients', async (req, res) => {
  try {
    const doctor = await getDoctorForRequest(req);
    if (!doctor) return res.status(400).json({ message: 'Doctor context is required' });

    const links = await DoctorPatient.find({ doctor: doctor._id, isActive: true })
      .populate('patient', 'name email phone createdAt')
      .sort({ updatedAt: -1 });

    return res.json(links);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/doctor/patients/:patientId
router.get('/patients/:patientId', async (req, res) => {
  try {
    const doctor = await getDoctorForRequest(req);
    if (!doctor) return res.status(400).json({ message: 'Doctor context is required' });

    const link = await DoctorPatient.findOne({
      doctor: doctor._id,
      patient: req.params.patientId,
      isActive: true,
    }).populate('patient', 'name email phone createdAt');
    if (!link) return res.status(404).json({ message: 'Patient is not assigned to this doctor' });

    const [appointments, prescriptions] = await Promise.all([
      Appointment.find({ doctor: doctor._id, patient: req.params.patientId }).sort({ date: -1 }).limit(30),
      Prescription.find({ doctor: doctor._id, patient: req.params.patientId }).sort({ createdAt: -1 }).limit(30),
    ]);

    return res.json({ link, appointments, prescriptions });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/doctor/patients/:patientId/notes
router.put('/patients/:patientId/notes', async (req, res) => {
  try {
    const doctor = await getDoctorForRequest(req);
    if (!doctor) return res.status(400).json({ message: 'Doctor context is required' });

    const link = await DoctorPatient.findOne({
      doctor: doctor._id,
      patient: req.params.patientId,
      isActive: true,
    });
    if (!link) return res.status(404).json({ message: 'Patient is not assigned to this doctor' });

    const before = { notes: link.notes || '' };
    link.notes = req.body.notes || '';
    await link.save();

    await logAudit(req, {
      action: 'doctor.patient.notes.update',
      entityType: 'patient',
      entityId: req.params.patientId,
      status: 'success',
      before,
      after: { notes: link.notes || '' },
    });
    return res.json(link);
  } catch (error) {
    await logAudit(req, {
      action: 'doctor.patient.notes.update',
      entityType: 'patient',
      entityId: req.params.patientId,
      status: 'failure',
      reason: error.message,
    });
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/doctor/prescriptions
router.post('/prescriptions', async (req, res) => {
  try {
    const doctor = await getDoctorForRequest(req);
    if (!doctor) return res.status(400).json({ message: 'Doctor context is required' });
    const { patientId, appointmentId, diagnosis, medicines, labTests, advice, followUpDate } = req.body;

    const link = await DoctorPatient.findOne({ doctor: doctor._id, patient: patientId, isActive: true });
    if (!link) return res.status(403).json({ message: 'Patient is not assigned to this doctor' });

    const patient = await User.findById(patientId).select('_id');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const rx = await Prescription.create({
      patient: patientId,
      doctor: doctor._id,
      appointment: appointmentId || null,
      diagnosis,
      medicines,
      labTests: Array.isArray(labTests) ? labTests : [],
      advice: advice || '',
      followUpDate: followUpDate || null,
    });

    await Notification.create({
      user: patientId,
      title: 'New Prescription Available',
      message: `Dr. ${doctor.name} added a new prescription for you.`,
      type: 'prescription',
      link: '/patient/prescriptions',
    });

    await logAudit(req, {
      action: 'doctor.prescription.create',
      entityType: 'prescription',
      entityId: rx._id,
      status: 'success',
      after: { patient: patientId, doctor: doctor._id },
    });
    return res.status(201).json(rx);
  } catch (error) {
    await logAudit(req, {
      action: 'doctor.prescription.create',
      entityType: 'prescription',
      status: 'failure',
      reason: error.message,
    });
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/doctor/prescriptions
router.get('/prescriptions', async (req, res) => {
  try {
    const doctor = await getDoctorForRequest(req);
    if (!doctor) return res.status(400).json({ message: 'Doctor context is required' });
    const prescriptions = await Prescription.find({ doctor: doctor._id })
      .populate('patient', 'name email phone')
      .populate('appointment', 'date timeSlot')
      .sort({ createdAt: -1 });
    return res.json(prescriptions);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

