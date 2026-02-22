const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/analytics/overview
router.get('/overview', protect, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalPatients, totalDoctors, totalAppointments,
      monthAppointments, lastMonthAppointments,
      newPatientsThisMonth, statusBreakdown, topDoctors,
      revenueData
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Appointment.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      User.countDocuments({ role: 'patient', createdAt: { $gte: startOfMonth } }),
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Appointment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$doctor', count: { $sum: 1 }, revenue: { $sum: '$fee' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctor' } },
        { $unwind: '$doctor' },
        { $project: { name: '$doctor.name', specialty: '$doctor.specialty', count: 1, revenue: 1 } }
      ]),
      // Revenue by month (last 6 months)
      Appointment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
        { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$fee' },
          count: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Appointments by day (last 14 days)
    const last14Days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const count = await Appointment.countDocuments({ createdAt: { $gte: d, $lt: next } });
      last14Days.push({ date: d.toISOString().split('T')[0], count });
    }

    // Monthly patients registered (last 6 months)
    const patientGrowth = await User.aggregate([
      { $match: { role: 'patient', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const totalRevenue = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$fee' } } }
    ]);

    res.json({
      totals: { totalPatients, totalDoctors, totalAppointments, totalRevenue: totalRevenue[0]?.total || 0 },
      monthStats: { monthAppointments, lastMonthAppointments, newPatientsThisMonth },
      statusBreakdown,
      topDoctors,
      revenueData,
      appointmentsByDay: last14Days,
      patientGrowth
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/analytics/specialty-stats
router.get('/specialty-stats', protect, adminOnly, async (req, res) => {
  try {
    const specialtyStats = await Appointment.aggregate([
      { $lookup: { from: 'doctors', localField: 'doctor', foreignField: '_id', as: 'doctorData' } },
      { $unwind: '$doctorData' },
      { $group: { _id: '$doctorData.specialty', count: { $sum: 1 }, revenue: { $sum: '$fee' } } },
      { $sort: { count: -1 } }
    ]);
    res.json(specialtyStats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
