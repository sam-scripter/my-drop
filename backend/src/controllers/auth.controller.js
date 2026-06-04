// auth.controller.js — Handles registration and login
//
// A controller contains the actual logic for each endpoint.
// The route file maps URLs to controllers.

const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { signToken } = require('../utils/jwt');
const { sendWelcomeEmail } = require('../services/email.service');

/**
 * POST /api/auth/register
 * Creates a new Business and first Manager user in one transaction.
 * A transaction means: if either the business or user creation fails,
 * BOTH are rolled back — you never end up with half-created data.
 */
async function register(req, res, next) {
  try {
    const {
    businessName,
    businessPhone,
    businessEmail,
    managerName,
    password,
    businessType,
  } = req.body;

    // Check if a business with this email already exists
    const existing = await prisma.business.findUnique({
      where: { email: businessEmail }
    });

    if (existing) {
      return res.status(409).json({
        error: true,
        message: 'A business with this email already exists',
        code: 'EMAIL_TAKEN'
      });
    }

    // Hash the password — never store plain text passwords
    // bcrypt automatically adds a "salt" to prevent rainbow table attacks
    // The "12" is the cost factor — higher = slower = more secure
    const password_hash = await bcrypt.hash(password, 12);

    // Create business and manager in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: businessName,
          phone: businessPhone,
          email: businessEmail,
          business_type: businessType || 'OTHER',
        }
      });

      const user = await tx.user.create({
        data: {
          business_id: business.id,
          name: managerName,
          phone: businessPhone,
          email: businessEmail,
          password_hash,
          role: 'MANAGER',
        }
      });

      return { business, user };
    });

    // Generate JWT token — managers get 7 days
    const token = signToken({
      userId: result.user.id,
      businessId: result.business.id,
      role: 'MANAGER',
    }, '7d');

    res.status(201).json({
      message: 'Business registered successfully',
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      business: {
        id: result.business.id,
        name: result.business.name,
      }
    });

    sendWelcomeEmail(
      { name: result.business.name },
      { name: result.user.name, email: result.user.email }
    ).catch(err => console.error('Welcome email failed:', err.message));

  } catch (err) {
    next(err); // passes to global error handler
  }
}

/**
 * POST /api/auth/login
 * Validates email + password, returns a JWT if correct.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user by email — include their business
    const user = await prisma.user.findUnique({
      where: { email },
      include: { business: true }
    });

    // Use the same error message for wrong email AND wrong password
    // This prevents attackers from discovering which emails are registered
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: true,
        message: 'Your account has been deactivated',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Compare the provided password against the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Managers get 7 days, riders get 30 days
    // Riders need longer tokens because they don't log in as frequently
    const expiresIn = user.role === 'MANAGER' ? '7d' : '30d';

    const token = signToken({
      userId: user.id,
      businessId: user.business_id,
      role: user.role,
    }, expiresIn);

    res.json({
      message: 'Login successful',
      token,
      must_change_password: user.must_change_password,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      business: {
        id: user.business.id,
        name: user.business.name,
        logo_url: user.business.logo_url,
      }
    });

  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/forgot-password
 * Accepts an email address, generates a time-limited reset token,
 * and emails a reset link to the user.
 *
 * Security note: we always return the same success message whether
 * the email exists or not — this prevents attackers from discovering
 * which emails are registered on the platform.
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    // Look up the user — but don't reveal if they exist or not
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Generate a secure random token
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');

      // Token expires in 1 hour
      const expires_at = new Date(Date.now() + 60 * 60 * 1000);

      // Invalidate any existing unused tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: {
          user_id: user.id,
          used: false,
        },
        data: { used: true }
      });

      // Save the new token
      await prisma.passwordResetToken.create({
        data: {
          user_id: user.id,
          token,
          expires_at,
        }
      });

      // Build the reset link
      const resetLink = `${process.env.APP_URL || 'https://mydrop.duckdns.org'}/reset-password?token=${token}`;

      // Send the email — don't await, don't block the response
      const { sendPasswordResetEmail } = require('../services/email.service');
      sendPasswordResetEmail(
        { name: user.name, email: user.email },
        resetLink
      ).catch(err => console.error('Password reset email failed:', err.message));
    }

    // Always return success — never reveal if email exists
    res.json({
      message: 'If an account with that email exists, a reset link has been sent.'
    });

  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/reset-password
 * Validates the reset token and sets a new password.
 * The token is marked as used after a successful reset
 * so it cannot be reused.
 */
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    // Find the token record
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    // Validate: token must exist, not be used, and not be expired
    if (!resetToken) {
      return res.status(400).json({
        error: true,
        message: 'Invalid or expired reset link. Please request a new one.',
        code: 'INVALID_TOKEN'
      });
    }

    if (resetToken.used) {
      return res.status(400).json({
        error: true,
        message: 'This reset link has already been used. Please request a new one.',
        code: 'TOKEN_USED'
      });
    }

    if (new Date() > resetToken.expires_at) {
      return res.status(400).json({
        error: true,
        message: 'This reset link has expired. Please request a new one.',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Hash the new password
    const password_hash = await bcrypt.hash(newPassword, 12);

    // Update password and clear must_change_password flag
    // Do both in a transaction so they succeed or fail together
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.user_id },
        data: {
          password_hash,
          must_change_password: false,
        }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      }),
    ]);

    res.json({ message: 'Password reset successfully. You can now log in.' });

  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, forgotPassword, resetPassword };