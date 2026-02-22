const mongoose = require('mongoose');
require('dotenv').config();

const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { generateTemporaryPassword } = require('../services/passwordService');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const doctors = await Doctor.find({ $or: [{ user: { $exists: false } }, { user: null }] });
  let updated = 0;

  for (const doctor of doctors) {
    let user = await User.findOne({ email: doctor.email });
    if (!user) {
      const tempPassword = generateTemporaryPassword();
      user = await User.create({
        name: doctor.name,
        email: doctor.email,
        password: tempPassword,
        phone: doctor.phone || '',
        role: 'doctor',
      });
      console.log(`Created doctor user for ${doctor.email} with temporary password: ${tempPassword}`);
    }
    doctor.user = user._id;
    await doctor.save();
    updated += 1;
  }

  console.log(`Backfill complete. Doctors linked: ${updated}`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

