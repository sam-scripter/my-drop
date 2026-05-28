// jwt.js — JWT token creation and verification
//
// JWT (JSON Web Token) is how we authenticate users after login.
// When a user logs in, we give them a token. They include that token
// in every subsequent request. We verify the token to know who they are.
//
// A JWT has three parts separated by dots:
//   header.payload.signature
// The payload contains the user's ID, business ID, and role.
// The signature ensures nobody tampered with it.

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

/**
 * Creates a JWT token for a user after login
 * @param {object} payload - { userId, businessId, role }
 * @param {string} expiresIn - e.g. '7d' for 7 days, '30d' for 30 days
 * @returns {string} signed JWT token
 */
function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verifies a JWT token and returns its payload
 * Throws an error if the token is invalid or expired
 * @param {string} token
 * @returns {object} decoded payload { userId, businessId, role }
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken };