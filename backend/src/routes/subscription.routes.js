// subscription.routes.js — Subscription management routes

const router = require('express').Router();
const {
  getSubscription,
  recordPayment,
  getPaymentHistory,
} = require('../controllers/subscription.controller');
const { authenticateJWT, requireRole } = require('../middleware/auth');

router.use(authenticateJWT);

// GET /api/subscription — current subscription status and usage
router.get('/', getSubscription);

// GET /api/subscription/history — payment history
router.get('/history', getPaymentHistory);

// POST /api/subscription/payment — admin records M-Pesa payment
// In production this would be restricted to an admin role
// For now any manager can call it (we'll add admin role in Phase 11)
router.post('/payment', requireRole('MANAGER'), recordPayment);

module.exports = router;