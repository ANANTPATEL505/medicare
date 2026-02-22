const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  actorRole: {
    type: String,
    enum: ['patient', 'doctor', 'admin', 'system'],
    default: 'system',
  },
  action: { type: String, required: true, trim: true },
  entityType: {
    type: String,
    enum: ['user', 'doctor', 'patient', 'appointment', 'prescription', 'review', 'triage', 'blog', 'contact', 'notification', 'system'],
    required: true,
  },
  entityId: { type: String, default: null },
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success',
  },
  before: { type: mongoose.Schema.Types.Mixed, default: null },
  after: { type: mongoose.Schema.Types.Mixed, default: null },
  meta: {
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    requestId: { type: String, default: '' },
    reason: { type: String, default: '' },
    route: { type: String, default: '' },
    method: { type: String, default: '' },
  },
  createdAt: { type: Date, default: Date.now },
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorUser: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

