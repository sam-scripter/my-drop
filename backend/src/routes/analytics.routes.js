// analytics.routes.js

const router = require('express').Router();
const { getToday } = require('../controllers/analytics.controller');
const { authenticateJWT, requireRole } = require('../middleware/auth');

router.use(authenticateJWT);

// GET /api/analytics/today — managers only
router.get('/today', requireRole('MANAGER'), getToday);

module.exports = router;