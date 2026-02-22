const mongoose = require('mongoose');

const doctorPatientSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source: {
    type: String,
    enum: ['appointment', 'manual', 'import'],
    default: 'appointment',
  },
  isActive: { type: Boolean, default: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

doctorPatientSchema.index({ doctor: 1, patient: 1 }, { unique: true });

module.exports = mongoose.model('DoctorPatient', doctorPatientSchema);

