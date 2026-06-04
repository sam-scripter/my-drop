// subscription.controller.js — Subscription management endpoints
//
// GET  /api/subscription        — current tier, status, usage for the dashboard
// POST /api/subscription/payment — admin records a confirmed M-Pesa payment

const prisma = require('../utils/prisma');
const { getLimits, getEffectiveTier, isSubscriptionActive, TIER_PRICING } = require('../utils/subscription');

/**
 * GET /api/subscription
 * Returns the business's current subscription status, usage,
 * and limits. Used by the dashboard to show the usage bar
 * and subscription details in Settings.
 */
async function getSubscription(req, res, next) {
  try {
    const business = await prisma.business.findUnique({
      where: { id: req.user.businessId }
    });

    const limits = getLimits(business.subscription_tier, business.subscription_status);
    const effectiveTier = getEffectiveTier(business);
    const active = isSubscriptionActive(business);

    // Calculate days remaining in trial or subscription
    let daysRemaining = null;
    const now = new Date();

    if (business.subscription_status === 'TRIAL' && business.trial_ends_at) {
      const diff = new Date(business.trial_ends_at) - now;
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } else if (business.subscription_status === 'ACTIVE' && business.subscription_ends_at) {
      const diff = new Date(business.subscription_ends_at) - now;
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // Usage percentage for the dashboard progress bar
    const usagePercent = limits.monthly_orders === Infinity
      ? 0
      : Math.round((business.monthly_order_count / limits.monthly_orders) * 100);

    res.json({
      subscription: {
        tier: business.subscription_tier,
        effective_tier: effectiveTier,
        status: business.subscription_status,
        is_active: active,
        trial_ends_at: business.trial_ends_at,
        subscription_ends_at: business.subscription_ends_at,
        days_remaining: daysRemaining,
      },
      usage: {
        monthly_orders: business.monthly_order_count,
        monthly_order_limit: limits.monthly_orders === Infinity ? null : limits.monthly_orders,
        usage_percent: usagePercent,
        is_near_limit: usagePercent >= 80,
        is_at_limit: usagePercent >= 100,
      },
      limits,
      pricing: TIER_PRICING,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/subscription/payment
 * Admin-only endpoint to record a confirmed M-Pesa payment
 * and activate or extend a business's subscription.
 *
 * This is manually triggered by the mydrop admin after verifying
 * the M-Pesa payment in the Safaricom portal.
 */
async function recordPayment(req, res, next) {
  try {
    const {
      businessId,
      amount,
      tier,
      months,
      mpesaReference,
      notes,
    } = req.body;

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({
        error: true,
        message: 'Business not found',
        code: 'NOT_FOUND'
      });
    }

    // Calculate subscription period
    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + (months || 1));

    // Record the payment
    const payment = await prisma.subscriptionPayment.create({
      data: {
        business_id: businessId,
        amount,
        tier,
        period_start: periodStart,
        period_end: periodEnd,
        payment_method: 'mpesa',
        mpesa_reference: mpesaReference,
        status: 'confirmed',
        notes,
      }
    });

    // Activate the subscription
    await prisma.business.update({
      where: { id: businessId },
      data: {
        subscription_tier: tier,
        subscription_status: 'ACTIVE',
        subscription_ends_at: periodEnd,
      }
    });

    res.json({
      message: `Subscription activated for ${business.name}. ${tier} plan until ${periodEnd.toDateString()}.`,
      payment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/subscription/history
 * Returns payment history for the authenticated business.
 */
async function getPaymentHistory(req, res, next) {
  try {
    const payments = await prisma.subscriptionPayment.findMany({
      where: { business_id: req.user.businessId },
      orderBy: { created_at: 'desc' },
    });

    res.json({ payments });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSubscription, recordPayment, getPaymentHistory };