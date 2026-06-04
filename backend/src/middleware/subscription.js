// subscription.js — Middleware to enforce subscription limits
//
// Applied to order creation and rider creation endpoints.
// Checks usage against the business's current tier limits.
// Returns HTTP 402 (Payment Required) if limit exceeded.
//
// Usage:
//   router.post('/orders', authenticateJWT, checkOrderLimit, createOrder)
//   router.post('/users/rider', authenticateJWT, requireRole('MANAGER'), checkRiderLimit, createRider)

const prisma = require('../utils/prisma');
const { getLimits, isSubscriptionActive } = require('../utils/subscription');

/**
 * Checks if the business can create another order this month.
 * Blocks with 402 if monthly_order_count >= tier limit.
 */
async function checkOrderLimit(req, res, next) {
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

    // Get the limits for this business's current tier and status
    const limits = getLimits(business.subscription_tier, business.subscription_status);
    const currentCount = business.monthly_order_count;

    // Unlimited tier — always allow
    if (limits.monthly_orders === Infinity) {
      return next();
    }

    // Check if limit is exceeded
    if (currentCount >= limits.monthly_orders) {
      return res.status(402).json({
        error: true,
        message: `You have reached your monthly order limit of ${limits.monthly_orders} orders. Upgrade your plan to create more orders.`,
        code: 'ORDER_LIMIT_EXCEEDED',
        current_count: currentCount,
        limit: limits.monthly_orders,
        upgrade_url: '/pricing',
      });
    }

    // Warn at 80% usage — attach to request so the response can include it
    if (currentCount >= limits.monthly_orders * 0.8) {
      req.usageWarning = {
        message: `You have used ${currentCount} of your ${limits.monthly_orders} monthly orders (${Math.round(currentCount / limits.monthly_orders * 100)}%).`,
        upgrade_url: '/pricing',
      };
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Checks if the business can add another active rider.
 * Counts currently active riders against the tier limit.
 */
async function checkRiderLimit(req, res, next) {
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

    const limits = getLimits(business.subscription_tier, business.subscription_status);

    // Unlimited tier — always allow
    if (limits.max_riders === Infinity) {
      return next();
    }

    // Count current active riders for this business
    const activeRiderCount = await prisma.user.count({
      where: {
        business_id: req.user.businessId,
        role: 'RIDER',
        is_active: true,
      }
    });

    if (activeRiderCount >= limits.max_riders) {
      return res.status(402).json({
        error: true,
        message: `You have reached your rider limit of ${limits.max_riders} active ${limits.max_riders === 1 ? 'rider' : 'riders'}. Upgrade your plan to add more riders.`,
        code: 'RIDER_LIMIT_EXCEEDED',
        current_count: activeRiderCount,
        limit: limits.max_riders,
        upgrade_url: '/pricing',
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { checkOrderLimit, checkRiderLimit };