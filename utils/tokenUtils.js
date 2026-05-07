const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

module.exports = { generateToken, generateRefreshToken };
