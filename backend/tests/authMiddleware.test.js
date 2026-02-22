const test = require('node:test');
const assert = require('node:assert/strict');
const { authorizeRoles } = require('../middleware/auth');

const createRes = () => {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.payload = data;
      return this;
    },
  };
};

test('authorizeRoles allows configured role', () => {
  const req = { user: { role: 'doctor' } };
  const res = createRes();
  let nextCalled = false;
  const next = () => { nextCalled = true; };
  authorizeRoles('doctor', 'admin')(req, res, next);
  assert.equal(nextCalled, true);
});

test('authorizeRoles denies non configured role', () => {
  const req = { user: { role: 'patient' } };
  const res = createRes();
  let nextCalled = false;
  const next = () => { nextCalled = true; };
  authorizeRoles('doctor', 'admin')(req, res, next);
  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});

