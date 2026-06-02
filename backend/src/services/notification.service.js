// notification.service.js — SMS notifications via Twilio
//
// Sends the customer a tracking link via SMS when an order is created.
// Built to be extended with WhatsApp later — just swap the send method.
//
// IMPORTANT: Notification failures should NEVER break the order flow.
// Always wrap calls to this service in try/catch.

const twilio = require('twilio');

// Lazy-initialize the client — only created when first needed
// This prevents startup crashes if Twilio env vars aren't set
let client = null;

function getClient() {
  if (!client) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured');
    }
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return client;
}

/**
 * Formats a Kenyan phone number to E.164 format (+254...)
 * Handles formats: 0712345678, 254712345678, +254712345678
 *
 * @param {string} phone
 * @returns {string} e.g. "+254712345678"
 */
function formatKenyanNumber(phone) {
  // Remove all spaces and dashes
  const cleaned = phone.replace(/[\s\-]/g, '');

  // Already in E.164 format
  if (cleaned.startsWith('+254')) return cleaned;

  // Has country code without +
  if (cleaned.startsWith('254')) return `+${cleaned}`;

  // Local format starting with 0
  if (cleaned.startsWith('0')) return `+254${cleaned.substring(1)}`;

  // Assume it's already a local number without leading 0
  return `+254${cleaned}`;
}

/**
 * Sends an SMS to the customer with their tracking link.
 * Called when an order is created and when a rider is assigned.
 *
 * @param {object} params
 * @param {string} params.customerPhone - Customer's phone number
 * @param {string} params.customerName - Customer's name
 * @param {string} params.businessName - Business name
 * @param {string} params.trackingUrl - Full tracking URL
 * @param {string} params.trigger - 'created' or 'assigned'
 */
async function sendOrderNotification({
  customerPhone,
  customerName,
  businessName,
  trackingUrl,
  trigger = 'created',
}) {
  const to = formatKenyanNumber(customerPhone);

  // Message varies depending on trigger
  const message = trigger === 'assigned'
    ? `Hi ${customerName}, your order from ${businessName} is on its way! Track your delivery here: ${trackingUrl}`
    : `Hi ${customerName}, your order from ${businessName} has been received. Track it here: ${trackingUrl}`;

  try {
    const result = await getClient().messages.create({
      body: message,
      from: process.env.TWILIO_SMS_FROM,
      to,
    });

    console.log(`SMS sent to ${to}: ${result.sid}`);
    return result;
  } catch (err) {
    // Log but don't throw — notification failure should not break order flow
    console.error(`SMS failed to ${to}:`, err.message);
    throw err; // re-throw so caller can decide how to handle
  }
}

module.exports = { sendOrderNotification, formatKenyanNumber };