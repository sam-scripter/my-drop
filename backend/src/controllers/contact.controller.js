// contact.controller.js — Handles contact form submissions
//
// Receives the contact form data and emails it to the mydrop
// support address. No auth required — this is a public endpoint.
// Rate limiting is handled by the global limiter in server.js.

const { sendEmail } = require('../services/email.service');

/**
 * POST /api/contact
 * Accepts contact form submission and emails it to support.
 */
async function submitContact(req, res, next) {
  try {
    const { name, email, businessName, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: true,
        message: 'Name, email, subject and message are required',
      });
    }

    // Email the support inbox
    await sendEmail({
      to: process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM,
      subject: `[mydrop contact] ${subject} — from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #1A73E8;">New contact form submission</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 140px;">Name</td>
              <td style="padding: 8px;">${name}</td>
            </tr>
            <tr style="background: #F8F9FA;">
              <td style="padding: 8px; font-weight: bold;">Email</td>
              <td style="padding: 8px;">
                <a href="mailto:${email}">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Business</td>
              <td style="padding: 8px;">${businessName || '—'}</td>
            </tr>
            <tr style="background: #F8F9FA;">
              <td style="padding: 8px; font-weight: bold;">Subject</td>
              <td style="padding: 8px;">${subject}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding: 16px; background: #F8F9FA; border-radius: 8px;">
            <strong>Message:</strong>
            <p style="margin-top: 8px; line-height: 1.6;">${message}</p>
          </div>

          <p style="margin-top: 20px; color: #9AA0A6; font-size: 12px;">
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    // Also update the sendEmail export in email.service.js
    // to export the base sendEmail function (currently it's not exported)

    res.json({
      message: 'Message sent successfully. We will get back to you within 24 hours.',
    });

  } catch (err) {
    next(err);
  }
}

module.exports = { submitContact };