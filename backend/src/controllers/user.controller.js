// user.controller.js — Rider and user management

const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { generateTempPassword } = require('../utils/helpers');


/**
 * POST /api/users/rider
 * Manager creates a new rider account.
 * - Generates a temporary password
 * - Sets must_change_password = true so the rider is forced to change it
 * - Emails the rider their credentials directly
 * - Does NOT return the temp password in the API response (security fix)
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

    // Get the business details for the email
    const business = await prisma.business.findUnique({
      where: { id: req.user.businessId }
    });

    const rider = await prisma.user.create({
      data: {
        business_id: req.user.businessId,
        name,
        phone,
        email,
        password_hash,
        role: 'RIDER',
        must_change_password: true, // rider must change on first login
      }
    });

    // Email the rider their credentials — don't await, don't block the response
    const { sendRiderCredentials } = require('../services/email.service');
    sendRiderCredentials(
      { name: rider.name, email: rider.email, phone: rider.phone },
      tempPassword,
      { name: business.name }
    ).catch(err => console.error('Rider credentials email failed:', err.message));

    // Return the rider info but NOT the temp password
    // The password goes to the rider's email only
    res.status(201).json({
      message: 'Rider account created successfully. Login credentials have been sent to their email.',
      rider: {
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        email: rider.email,
        role: rider.role,
      },
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
 * PUT /api/users/change-password
 * Allows any logged-in user (manager or rider) to change their password.
 * Also clears the must_change_password flag after a successful change.
 * Requires the current password to be provided as verification.
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get the full user record including password hash
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found',
        code: 'NOT_FOUND'
      });
    }

    // Verify current password is correct before allowing the change
    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(400).json({
        error: true,
        message: 'Current password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }

    // Hash the new password
    const new_password_hash = await bcrypt.hash(newPassword, 12);

    // Update password and clear the must_change_password flag
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: new_password_hash,
        must_change_password: false,
      }
    });

    res.json({ message: 'Password changed successfully' });
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

/**
 * PUT /api/users/me
 * Allows the logged-in manager to update their own
 * name and phone number. Email cannot be changed.
 */
async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        error: true,
        message: 'Name must be at least 2 characters',
        code: 'INVALID_NAME'
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        name: name.trim(),
        phone: phone?.trim() || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      }
    });

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    next(err);
  }
}

module.exports = { createRider, getRiders, updateFcmToken, toggleRiderStatus, changePassword, updateProfile };