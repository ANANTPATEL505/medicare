const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('auth register route enforces patient role', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'routes', 'auth.js'), 'utf8');
  assert.match(source, /role:\s*'patient'/);
  assert.doesNotMatch(source, /\{\s*name,\s*email,\s*password,\s*phone,\s*role\s*\}\s*=\s*req\.body/);
});

