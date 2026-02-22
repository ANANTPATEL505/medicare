const mongoose = require('mongoose');
require('dotenv').config();

const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const admin = await User.findOne({ role: 'admin' }).select('_id role');
  if (!admin) throw new Error('Admin user not found');

  const now = new Date();
  const samples = [
    {
      actorUser: admin._id,
      actorRole: 'admin',
      action: 'doctor.create',
      entityType: 'doctor',
      entityId: 'sample-doctor-id',
      status: 'success',
      after: { email: 'doctor.sample@medicare.com' },
      meta: { route: '/api/doctors', method: 'POST', requestId: 'seed-1' },
      createdAt: now,
    },
    {
      actorUser: admin._id,
      actorRole: 'admin',
      action: 'appointment.status.update',
      entityType: 'appointment',
      entityId: 'sample-appointment-id',
      status: 'success',
      before: { status: 'pending' },
      after: { status: 'confirmed' },
      meta: { route: '/api/appointments/:id/status', method: 'PUT', requestId: 'seed-2' },
      createdAt: new Date(now.getTime() - 10 * 60 * 1000),
    },
  ];

  await AuditLog.insertMany(samples);
  console.log('Sample audit logs inserted');
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

