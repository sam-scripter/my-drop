// helpers.js — Small reusable utility functions

const { customAlphabet } = require('nanoid');

// Tracking token generator
// Uses only uppercase letters and numbers — easy to read, no ambiguous chars
// like 0/O or 1/l. Generates an 8-character token e.g. "X7K2M9PQ"
const generateTrackingToken = customAlphabet(
  'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  8
);

/**
 * Generates a 4-digit delivery PIN
 * The customer shows this to the rider to confirm delivery
 * @returns {string} e.g. "7421"
 */
function generateDeliveryPin() {
  // Math.random() gives 0.0000 to 0.9999
  // We want 1000 to 9999 (always 4 digits, never starts with 0)
  return String(Math.floor(Math.random() * 9000) + 1000);
}

/**
 * Generates a temporary password for new rider accounts
 * Managers create rider accounts — this password is SMS'd to the rider
 * who should change it on first login
 * @returns {string} e.g. "Kd9#mP2x"
 */
function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

module.exports = {
  generateTrackingToken,
  generateDeliveryPin,
  generateTempPassword,
};