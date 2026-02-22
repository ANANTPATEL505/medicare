const crypto = require('crypto');

const generateTemporaryPassword = () => {
  const base = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  return `${base}A1!`;
};

module.exports = {
  generateTemporaryPassword,
};

