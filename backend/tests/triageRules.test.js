const test = require('node:test');
const assert = require('node:assert/strict');
const { triageWithRules } = require('../services/triageRules');

test('triageWithRules detects emergency red flag', () => {
  const result = triageWithRules({
    symptomsText: 'Severe chest pain and unable to breathe for 20 minutes',
  });
  assert.equal(result.urgencyLevel, 'emergency');
  assert.ok(result.redFlags.length >= 1);
  assert.ok(result.recommendedSpecialties.some((s) => s.specialty === 'Cardiology'));
});

test('triageWithRules returns fallback specialty for unknown symptoms', () => {
  const result = triageWithRules({
    symptomsText: 'General tiredness without specific pattern',
  });
  assert.ok(result.recommendedSpecialties.length >= 1);
  assert.equal(result.recommendedSpecialties[0].specialty, 'General Medicine');
});

