// subscription.js — Subscription tier definitions and limit helpers
//
// Defines what each tier is allowed to do.
// These constants are used by the subscription middleware to enforce
// limits before creating orders or riders.
//
// Tier limits:
//   FREE:    30 orders/month, 1 rider
//   STARTER: 200 orders/month, 5 riders
//   GROWTH:  1000 orders/month, 20 riders
//   SCALE:   unlimited orders, unlimited riders

const TIER_LIMITS = {
  FREE: {
    monthly_orders: 30,
    max_riders: 1,
    has_reports: false,
    has_custom_branding: false,
    has_api_access: false,
  },
  STARTER: {
    monthly_orders: 200,
    max_riders: 5,
    has_reports: true,
    has_custom_branding: false,
    has_api_access: false,
  },
  GROWTH: {
    monthly_orders: 1000,
    max_riders: 20,
    has_reports: true,
    has_custom_branding: true,
    has_api_access: false,
  },
  SCALE: {
    monthly_orders: Infinity, // unlimited
    max_riders: Infinity,     // unlimited
    has_reports: true,
    has_custom_branding: true,
    has_api_access: true,
  },
};

// Pricing in KES for display on the pricing page
const TIER_PRICING = {
  FREE: { monthly: 0, annual: 0 },
  STARTER: { monthly: 1500, annual: 15000 },  // 2 months free annually
  GROWTH: { monthly: 4000, annual: 40000 },
  SCALE: { monthly: 10000, annual: 100000 },
};

/**
 * Returns the limits for a given subscription tier.
 * During a TRIAL, the business gets STARTER limits.
 *
 * @param {string} tier - SubscriptionTier enum value
 * @param {string} status - SubscriptionStatus enum value
 * @returns {object} limits for this tier
 */
function getLimits(tier, status) {
  // Trial accounts get STARTER limits
  if (status === 'TRIAL') return TIER_LIMITS.STARTER;
  return TIER_LIMITS[tier] || TIER_LIMITS.FREE;
}

/**
 * Checks if a business's subscription is currently active.
 * A business is active if:
 * - Status is TRIAL and trial has not expired
 * - Status is ACTIVE and subscription has not expired
 *
 * @param {object} business - Business record from database
 * @returns {boolean}
 */
function isSubscriptionActive(business) {
  const now = new Date();

  if (business.subscription_status === 'TRIAL') {
    return business.trial_ends_at && new Date(business.trial_ends_at) > now;
  }

  if (business.subscription_status === 'ACTIVE') {
    return business.subscription_ends_at &&
      new Date(business.subscription_ends_at) > now;
  }

  return false;
}

/**
 * Returns the effective tier for display and limit purposes.
 * Trial accounts show as STARTER.
 * Expired accounts show as FREE regardless of their previous tier.
 *
 * @param {object} business - Business record from database
 * @returns {string} effective tier name
 */
function getEffectiveTier(business) {
  if (!isSubscriptionActive(business)) return 'FREE';
  if (business.subscription_status === 'TRIAL') return 'STARTER (Trial)';
  return business.subscription_tier;
}

module.exports = { TIER_LIMITS, TIER_PRICING, getLimits, isSubscriptionActive, getEffectiveTier };