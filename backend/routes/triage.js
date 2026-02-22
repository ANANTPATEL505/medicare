const express = require('express');
const router = express.Router();
const TriageSession = require('../models/TriageSession');
const { optionalProtect, protect } = require('../middleware/auth');
const { triageEngine } = require('../services/triageEngine');
const { logAudit } = require('../services/auditService');

// POST /api/triage/analyze
router.post('/analyze', optionalProtect, async (req, res) => {
  try {
    const { symptomsText, age, sex, chronicConditions } = req.body || {};
    if (!symptomsText || typeof symptomsText !== 'string' || !symptomsText.trim()) {
      return res.status(400).json({ message: 'symptomsText is required' });
    }

    const demographics = {
      age: age ?? null,
      sex: sex || '',
      chronicConditions: Array.isArray(chronicConditions) ? chronicConditions : [],
    };

    const result = await triageEngine({ symptomsText, demographics });

    let triageSession = null;
    if (req.user) {
      triageSession = await TriageSession.create({
        patient: req.user._id,
        symptomsText,
        demographics,
        recommendedSpecialties: result.recommendedSpecialties,
        urgencyLevel: result.urgencyLevel,
        advice: result.advice,
        redFlags: result.redFlags,
        nextStep: result.nextStep,
        engine: result.engine || 'rules',
        model: result.model || '',
      });
    }

    await logAudit(req, {
      action: 'triage.create',
      entityType: 'triage',
      entityId: triageSession?._id || null,
      status: 'success',
      after: { urgencyLevel: result.urgencyLevel, specialties: result.recommendedSpecialties?.map((s) => s.specialty) || [] },
    });

    return res.json({
      triageSessionId: triageSession?._id || null,
      urgencyLevel: result.urgencyLevel,
      recommendedSpecialties: result.recommendedSpecialties,
      advice: result.advice,
      redFlags: result.redFlags,
      nextStep: result.nextStep,
      disclaimer: result.disclaimer,
      engine: result.engine,
      model: result.model || '',
      fallbackReason: result.fallbackReason || '',
    });
  } catch (error) {
    await logAudit(req, {
      action: 'triage.create',
      entityType: 'triage',
      status: 'failure',
      reason: error.message,
    });
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/triage/my
router.get('/my', protect, async (req, res) => {
  try {
    const sessions = await TriageSession.find({ patient: req.user._id }).sort({ createdAt: -1 }).limit(50);
    return res.json(sessions);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/triage/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await TriageSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Triage session not found' });

    if (req.user.role !== 'admin' && session.patient?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this triage session' });
    }
    return res.json(session);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

