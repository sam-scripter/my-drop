// user.controller.js — Rider and user management

const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { generateTempPassword } = require('../utils/helpers');

/**
 * POST /api/users/rider
 * Manager creates a new rider account.
 * In Phase 6, the temporary password will be SMS'd to the rider via Twilio.
 * For now it's returned in the response so you can test.
 */
async function createRider(req, res, next) {
  try {
    const { name, phone, email } = req.body;

    // Check this email isn't already taken
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        error: true,
        message: 'A user with this email already exists',
        code: 'EMAIL_TAKEN'
      });
    }

    const tempPassword = generateTempPassword();
    const password_hash = await bcrypt.hash(tempPassword, 12);

    const rider = await prisma.user.create({
      data: {
        business_id: req.user.businessId, // scoped to this manager's business
        name,
        phone,
        email,
        password_hash,
        role: 'RIDER',
      }
    });

    // TODO Phase 6: send tempPassword to rider via Twilio SMS
    // For now, return it in the response for testing
    res.status(201).json({
      message: 'Rider account created successfully',
      rider: {
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        email: rider.email,
        role: rider.role,
      },
      tempPassword, // remove this after Phase 6 SMS is implemented
    });

  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/riders
 * Returns all riders for this business.
 * businessId from JWT ensures managers only see their own riders.
 */
async function getRiders(req, res, next) {
  try {
    const riders = await prisma.user.findMany({
      where: {
        business_id: req.user.businessId,
        role: 'RIDER',
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        is_active: true,
        created_at: true,
        // Count how many deliveries this rider has completed
        _count: {
          select: { deliveries: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ riders });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/fcm-token
 * Rider app calls this after login to register their device
 * for push notifications. FCM token changes when the app is
 * reinstalled, so we update it on every login.
 */
async function updateFcmToken(req, res, next) {
  try {
    const { fcm_token } = req.body;

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { fcm_token }
    });

    res.json({ message: 'FCM token updated successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/riders/:id/toggle
 * Manager activates or deactivates a rider account.
 */
async function toggleRiderStatus(req, res, next) {
  try {
    const rider = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        business_id: req.user.businessId, // security: can only toggle own riders
        role: 'RIDER',
      }
    });

    if (!rider) {
      return res.status(404).json({
        error: true,
        message: 'Rider not found',
        code: 'NOT_FOUND'
      });
    }

    const updated = await prisma.user.update({
      where: { id: rider.id },
      data: { is_active: !rider.is_active }
    });

    res.json({
      message: `Rider ${updated.is_active ? 'activated' : 'deactivated'} successfully`,
      is_active: updated.is_active
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createRider, getRiders, updateFcmToken, toggleRiderStatus };