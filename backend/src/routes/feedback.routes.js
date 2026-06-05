// feedback.routes.js — Customer feedback endpoints

const router = require('express').Router();
const { getFeedback } = require('../controllers/feedback.controller');
const { authenticateJWT, requireRole } = require('../middleware/auth');

router.use(authenticateJWT);

// GET /api/feedback — all ratings for this business
router.get('/', requireRole('MANAGER'), getFeedback);

module.exports = router;