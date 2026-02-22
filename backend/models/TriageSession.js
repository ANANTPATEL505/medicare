const mongoose = require('mongoose');

const specialtyRecommendationSchema = new mongoose.Schema({
  specialty: { type: String, required: true, trim: true },
  confidence: { type: Number, min: 0, max: 1, default: 0.5 },
  reason: { type: String, default: '' },
}, { _id: false });

const triageSessionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  symptomsText: { type: String, required: true, trim: true },
  demographics: {
    age: { type: Number, min: 0, max: 130, default: null },
    sex: { type: String, default: '' },
    chronicConditions: { type: [String], default: [] },
  },
  recommendedSpecialties: { type: [specialtyRecommendationSchema], default: [] },
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'low',
  },
  advice: { type: [String], default: [] },
  redFlags: { type: [String], default: [] },
  nextStep: { type: String, default: '' },
  engine: {
    type: String,
    enum: ['openai', 'rules', 'hybrid'],
    default: 'rules',
  },
  model: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

triageSessionSchema.index({ patient: 1, createdAt: -1 });
triageSessionSchema.index({ urgencyLevel: 1, createdAt: -1 });

module.exports = mongoose.model('TriageSession', triageSessionSchema);

