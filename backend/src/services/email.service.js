// email.service.js — All outgoing emails for mydrop
//
// Uses Nodemailer with Gmail SMTP to send transactional emails.
// All email types are defined here as named functions.
// To switch email providers later (e.g. SendGrid), only this
// file needs to change — all callers remain the same.
//
// Environment variables required:
//   EMAIL_FROM          — Gmail address to send from
//   EMAIL_APP_PASSWORD  — Google App Password (16 characters)
//   EMAIL_FROM_NAME     — Display name e.g. "mydrop"

const nodemailer = require('nodemailer');

// ── Transporter ────────────────────────────────────────────────────────
// Created once and reused for all emails.
// Gmail requires an App Password when 2-step verification is enabled.
// Never use your real Gmail password here.

let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (!process.env.EMAIL_FROM || !process.env.EMAIL_APP_PASSWORD) {
      console.warn('Email credentials not configured — emails will be skipped');
      return null;
    }

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

// ── Base send function ─────────────────────────────────────────────────
// All email functions call this. Errors are logged but never thrown —
// a failed email should never crash the main request flow.

async function sendEmail({ to, subject, html, text }) {
  const transport = getTransporter();

  if (!transport) {
    console.log(`[Email skipped — not configured] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    const info = await transport.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'mydrop'}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // plain text fallback
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`Email failed to ${to}:`, err.message);
    // Don't throw — email failure should never break the main flow
  }
}

// ── Email templates ────────────────────────────────────────────────────
// Each function below is one email type.
// HTML is inline for simplicity — no template engine needed at this scale.

/**
 * Sent to the manager immediately after their business registers.
 * Sets expectations and directs them to the dashboard.
 *
 * @param {object} business - { name }
 * @param {object} manager - { name, email }
 */
async function sendWelcomeEmail(business, manager) {
  await sendEmail({
    to: manager.email,
    subject: `Welcome to mydrop, ${manager.name.split(' ')[0]}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1A73E8; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚚 mydrop</h1>
        </div>

        <div style="padding: 32px; background: #ffffff;">
          <h2 style="color: #202124;">Welcome, ${manager.name.split(' ')[0]}!</h2>

          <p style="color: #5F6368; line-height: 1.6;">
            <strong>${business.name}</strong> is now live on mydrop.
            Your customers can start tracking their deliveries in real time.
          </p>

          <h3 style="color: #202124;">Get started in 3 steps:</h3>
          <ol style="color: #5F6368; line-height: 2;">
            <li>Add your first rider under <strong>Riders</strong></li>
            <li>Create your first order under <strong>New Order</strong></li>
            <li>Share the tracking link with your customer</li>
          </ol>

          <div style="text-align: center; margin: 32px 0;">
            <a href="https://mydrop.duckdns.org/dashboard"
               style="background: #1A73E8; color: white; padding: 14px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: bold;
                      font-size: 16px;">
              Go to Dashboard →
            </a>
          </div>

          <p style="color: #9AA0A6; font-size: 13px;">
            Your 14-day free trial has started. No credit card required.
          </p>
        </div>

        <div style="padding: 16px; background: #F8F9FA; text-align: center;">
          <p style="color: #9AA0A6; font-size: 12px; margin: 0;">
            mydrop — Real-time delivery tracking for businesses in Kenya
          </p>
        </div>
      </div>
    `,
  });
}

/**
 * Sent to a new rider when a manager creates their account.
 * Contains their login credentials and instructions to change password.
 *
 * @param {object} rider - { name, email, phone }
 * @param {string} tempPassword - the generated temporary password
 * @param {object} business - { name }
 */
async function sendRiderCredentials(rider, tempPassword, business) {
  await sendEmail({
    to: rider.email,
    subject: `Your mydrop rider account is ready — ${business.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1A73E8; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚚 mydrop</h1>
        </div>

        <div style="padding: 32px; background: #ffffff;">
          <h2 style="color: #202124;">Hi ${rider.name.split(' ')[0]},</h2>

          <p style="color: #5F6368; line-height: 1.6;">
            <strong>${business.name}</strong> has added you as a rider on mydrop.
            Download the mydrop app and log in with the credentials below.
          </p>

          <div style="background: #F8F9FA; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #5F6368; font-size: 13px;">YOUR LOGIN CREDENTIALS</p>
            <p style="margin: 0 0 4px;"><strong>Email:</strong> ${rider.email}</p>
            <p style="margin: 0 0 16px;"><strong>Temporary Password:</strong>
              <span style="font-family: monospace; font-size: 18px; color: #1A73E8;
                           background: #E8F0FE; padding: 4px 8px; border-radius: 4px;">
                ${tempPassword}
              </span>
            </p>
            <p style="margin: 0; color: #EA4335; font-size: 13px;">
              ⚠️ Please change your password after your first login.
            </p>
          </div>

          <h3 style="color: #202124;">How to get started:</h3>
          <ol style="color: #5F6368; line-height: 2;">
            <li>Download the mydrop app on your Android phone</li>
            <li>Log in with the email and password above</li>
            <li>Change your password in Settings</li>
            <li>Wait for your first delivery assignment</li>
          </ol>

          <p style="color: #9AA0A6; font-size: 13px; margin-top: 24px;">
            If you didn't expect this email, contact ${business.name} directly.
          </p>
        </div>

        <div style="padding: 16px; background: #F8F9FA; text-align: center;">
          <p style="color: #9AA0A6; font-size: 12px; margin: 0;">
            mydrop — Real-time delivery tracking for businesses in Kenya
          </p>
        </div>
      </div>
    `,
  });
}

/**
 * Sent when a user requests a password reset.
 * The reset link is valid for 1 hour.
 *
 * @param {object} user - { name, email }
 * @param {string} resetLink - full URL with token e.g. https://mydrop.../reset-password?token=...
 */
async function sendPasswordResetEmail(user, resetLink) {
  await sendEmail({
    to: user.email,
    subject: 'Reset your mydrop password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1A73E8; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚚 mydrop</h1>
        </div>

        <div style="padding: 32px; background: #ffffff;">
          <h2 style="color: #202124;">Reset your password</h2>

          <p style="color: #5F6368; line-height: 1.6;">
            Hi ${user.name.split(' ')[0]}, we received a request to reset your password.
            Click the button below to set a new one.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}"
               style="background: #1A73E8; color: white; padding: 14px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: bold;
                      font-size: 16px;">
              Reset Password →
            </a>
          </div>

          <p style="color: #9AA0A6; font-size: 13px; text-align: center;">
            This link expires in 1 hour.
          </p>

          <p style="color: #9AA0A6; font-size: 13px;">
            If you didn't request a password reset, you can safely ignore this email.
            Your password will not change.
          </p>
        </div>

        <div style="padding: 16px; background: #F8F9FA; text-align: center;">
          <p style="color: #9AA0A6; font-size: 12px; margin: 0;">
            mydrop — Real-time delivery tracking for businesses in Kenya
          </p>
        </div>
      </div>
    `,
  });
}

/**
 * Sent to the business manager when their trial is about to expire.
 * Sent at day 10 of the 14-day trial via a cron job.
 *
 * @param {object} business - { name }
 * @param {object} manager - { name, email }
 * @param {number} daysRemaining - number of days left in trial
 */
async function sendTrialExpiryWarning(business, manager, daysRemaining) {
  await sendEmail({
    to: manager.email,
    subject: `Your mydrop trial ends in ${daysRemaining} days`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1A73E8; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚚 mydrop</h1>
        </div>

        <div style="padding: 32px; background: #ffffff;">
          <h2 style="color: #202124;">
            Your trial ends in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}
          </h2>

          <p style="color: #5F6368; line-height: 1.6;">
            Hi ${manager.name.split(' ')[0]}, your free trial for
            <strong>${business.name}</strong> on mydrop ends soon.
          </p>

          <p style="color: #5F6368; line-height: 1.6;">
            After your trial ends, you'll be moved to the free plan which includes
            up to 30 orders/month and 1 rider account.
          </p>

          <div style="background: #FFF8E1; border-radius: 8px; padding: 20px;
                      margin: 24px 0; border-left: 4px solid #FBBC04;">
            <p style="margin: 0; color: #5F6368;">
              To keep your current limits (200 orders/month, 5 riders),
              upgrade to the <strong>Starter plan</strong> for KES 1,500/month.
            </p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="https://mydrop.duckdns.org/pricing"
               style="background: #1A73E8; color: white; padding: 14px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: bold;
                      font-size: 16px;">
              View Pricing →
            </a>
          </div>
        </div>

        <div style="padding: 16px; background: #F8F9FA; text-align: center;">
          <p style="color: #9AA0A6; font-size: 12px; margin: 0;">
            mydrop — Real-time delivery tracking for businesses in Kenya
          </p>
        </div>
      </div>
    `,
  });
}

module.exports = {
  sendEmail, 
  sendWelcomeEmail,
  sendRiderCredentials,
  sendPasswordResetEmail,
  sendTrialExpiryWarning,
};