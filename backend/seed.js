const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Blog = require('./models/Blog');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const DoctorPatient = require('./models/DoctorPatient');
const TriageSession = require('./models/TriageSession');

const doctors = [
  { name: 'Dr. Sarah Johnson', email: 'sarah.johnson@medicare.com', specialty: 'Cardiology', qualification: 'MD, FACC', experience: 15, phone: '+1-555-0101', consultationFee: 800, rating: 4.9, totalReviews: 234, department: 'Heart Institute', availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
  { name: 'Dr. Michael Chen', email: 'michael.chen@medicare.com', specialty: 'Neurology', qualification: 'MD, PhD', experience: 12, phone: '+1-555-0102', consultationFee: 750, rating: 4.8, totalReviews: 189, department: 'Neuroscience Center', availableDays: ['Monday', 'Wednesday', 'Friday'], availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
  { name: 'Dr. Emily Rodriguez', email: 'emily.rodriguez@medicare.com', specialty: 'Pediatrics', qualification: 'MD, FAAP', experience: 10, phone: '+1-555-0103', consultationFee: 600, rating: 4.9, totalReviews: 312, department: 'Children Health Center', availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'], availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
];

const blogs = [
  {
    title: '10 Heart Healthy Habits You Should Start Today',
    excerpt: 'Simple lifestyle changes can reduce heart disease risk.',
    content: '<h2>Heart Health Basics</h2><p>Exercise regularly, eat whole foods, and monitor blood pressure.</p>',
    category: 'Health Tips',
    author: 'Dr. Sarah Johnson',
    authorRole: 'Senior Cardiologist',
    tags: ['heart', 'lifestyle'],
    readTime: 5,
    isFeatured: true,
    isPublished: true,
  },
  {
    title: 'Understanding Childhood Vaccinations',
    excerpt: 'What parents should know about vaccines and schedules.',
    content: '<h2>Vaccination Guide</h2><p>Follow your pediatrician and complete recommended schedules.</p>',
    category: 'Disease Prevention',
    author: 'Dr. Emily Rodriguez',
    authorRole: 'Pediatric Specialist',
    tags: ['vaccines', 'children'],
    readTime: 6,
    isFeatured: true,
    isPublished: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Blog.deleteMany({}),
      Appointment.deleteMany({}),
      Prescription.deleteMany({}),
      DoctorPatient.deleteMany({}),
      TriageSession.deleteMany({}),
    ]);

    const admin = await User.create({ name: 'Main Admin', email: 'admin@medicare.com', password: 'admin123', role: 'admin' });
    const patient = await User.create({ name: 'John Patient', email: 'patient@medicare.com', password: 'patient123', role: 'patient', phone: '+1-555-0200' });

    const doctorRecords = [];
    for (let i = 0; i < doctors.length; i += 1) {
      const doctorData = doctors[i];
      const doctorUser = await User.create({
        name: doctorData.name,
        email: doctorData.email,
        password: `doctor${i + 1}23`,
        role: 'doctor',
        phone: doctorData.phone,
      });
      const doctor = await Doctor.create({ ...doctorData, user: doctorUser._id, isActive: true, isAvailable: true });
      doctorRecords.push({ doctor, doctorUser });
    }

    const appointmentFutureDate = new Date();
    appointmentFutureDate.setDate(appointmentFutureDate.getDate() + 2);
    const appointmentPastDate = new Date();
    appointmentPastDate.setDate(appointmentPastDate.getDate() - 3);

    const createdAppointments = await Appointment.create([
      {
        patient: patient._id,
        doctor: doctorRecords[0].doctor._id,
        patientName: patient.name,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        date: appointmentFutureDate,
        timeSlot: '10:00',
        symptoms: 'Chest pain and fatigue',
        status: 'confirmed',
        fee: doctorRecords[0].doctor.consultationFee,
      },
      {
        patient: patient._id,
        doctor: doctorRecords[1].doctor._id,
        patientName: patient.name,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        date: appointmentPastDate,
        timeSlot: '09:00',
        symptoms: 'Headache and dizziness',
        status: 'completed',
        fee: doctorRecords[1].doctor.consultationFee,
        isPaid: true,
      },
    ]);

    await DoctorPatient.create({
      doctor: doctorRecords[1].doctor._id,
      patient: patient._id,
      assignedBy: admin._id,
      source: 'manual',
      isActive: true,
      notes: 'Monitor headache severity and hydration.',
    });

    await TriageSession.create({
      patient: patient._id,
      symptomsText: 'I feel chest discomfort and shortness of breath while climbing stairs',
      demographics: { age: 41, sex: 'male', chronicConditions: ['hypertension'] },
      recommendedSpecialties: [{ specialty: 'Cardiology', confidence: 0.84, reason: 'Cardiac symptom pattern matched.' }],
      urgencyLevel: 'high',
      advice: ['Avoid heavy exertion.', 'Book same-day consultation.'],
      redFlags: ['Persistent chest discomfort'],
      nextStep: 'Book a same-day cardiology consultation.',
      engine: 'rules',
      model: '',
    });

    await Prescription.create({
      appointment: createdAppointments[1]._id,
      patient: patient._id,
      doctor: doctorRecords[1].doctor._id,
      diagnosis: 'Migraine',
      medicines: [
        { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After food' },
      ],
      advice: 'Reduce screen time and sleep 7 to 8 hours.',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await Blog.insertMany(blogs);

    console.log('\nDatabase seeded successfully.\n');
    console.log('Demo credentials:');
    console.log('Admin:   admin@medicare.com / admin123');
    console.log('Patient: patient@medicare.com / patient123');
    console.log('Doctor:  sarah.johnson@medicare.com / doctor123');
    console.log('Doctor:  michael.chen@medicare.com / doctor223');
    console.log('Doctor:  emily.rodriguez@medicare.com / doctor323');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();

