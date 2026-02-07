const crypto = require('crypto');

// SHA-256 Password Hashing
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify Password
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Generate random token
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken
};
