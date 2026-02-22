const AuditLog = require('../models/AuditLog');

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'authorization',
  'currentPassword',
  'newPassword',
  'confirmPassword',
]);

const sanitizeValue = (value) => {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (typeof value !== 'object') return value;

  const out = {};
  for (const [key, val] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(key)) {
      out[key] = '[REDACTED]';
    } else {
      out[key] = sanitizeValue(val);
    }
  }
  return out;
};

const logAudit = async (req, payload) => {
  try {
    await AuditLog.create({
      actorUser: req?.user?._id || null,
      actorRole: req?.user?.role || 'system',
      action: payload.action,
      entityType: payload.entityType || 'system',
      entityId: payload.entityId ? String(payload.entityId) : null,
      status: payload.status || 'success',
      before: sanitizeValue(payload.before || null),
      after: sanitizeValue(payload.after || null),
      meta: {
        ip: req?.ip || '',
        userAgent: req?.headers?.['user-agent'] || '',
        requestId: req?.requestId || '',
        reason: payload.reason || '',
        route: req?.originalUrl || '',
        method: req?.method || '',
      },
    });
  } catch (error) {
    // Do not block the main request on log persistence errors.
  }
};

module.exports = { logAudit, sanitizeValue };

