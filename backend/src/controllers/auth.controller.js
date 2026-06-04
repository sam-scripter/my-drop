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

module.exports = { register, login };