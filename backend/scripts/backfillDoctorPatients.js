const mongoose = require('mongoose');
require('dotenv').config();

const Appointment = require('../models/Appointment');
const DoctorPatient = require('../models/DoctorPatient');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const systemAdmin = await User.findOne({ role: 'admin' }).select('_id');
  if (!systemAdmin) {
    throw new Error('No admin user found. Create an admin user before running this migration.');
  }

  const appointments = await Appointment.find().select('doctor patient');
  let linked = 0;
  for (const appt of appointments) {
    await DoctorPatient.findOneAndUpdate(
      { doctor: appt.doctor, patient: appt.patient },
      {
        doctor: appt.doctor,
        patient: appt.patient,
        assignedBy: systemAdmin._id,
        source: 'import',
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    linked += 1;
  }

  console.log(`Backfill complete. Links upserted from appointments: ${linked}`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

