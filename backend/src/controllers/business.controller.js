// business.controller.js — Business profile management

const prisma = require('../utils/prisma');

/**
 * GET /api/business/me
 * Returns the authenticated user's business details.
 * businessId comes from the JWT — so a manager can only see their own business.
 */
async function getMyBusiness(req, res, next) {
  try {
    const business = await prisma.business.findUnique({
      where: { id: req.user.businessId }
    });

    if (!business) {
      return res.status(404).json({
        error: true,
        message: 'Business not found',
        code: 'NOT_FOUND'
      });
    }

    res.json({ business });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/business/me
 * Updates business details. Only MANAGER role can do this.
 */
async function updateMyBusiness(req, res, next) {
  try {
    const business = await prisma.business.update({
      where: { id: req.user.businessId },
      data: req.body, // already validated by middleware
    });

    res.json({
      message: 'Business updated successfully',
      business
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyBusiness, updateMyBusiness };