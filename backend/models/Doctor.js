const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  specialty: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: Number, required: true },
  bio: { type: String },
  phone: { type: String },
  avatar: { type: String, default: '' },
  consultationFee: { type: Number, default: 500 },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  availableDays: {
    type: [String],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  availableSlots: {
    type: [String],
    default: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
  },
  department: { type: String },
  isActive: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', doctorSchema);
