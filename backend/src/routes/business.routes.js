// business.routes.js

const router = require('express').Router();
const { getMyBusiness, updateMyBusiness } = require('../controllers/business.controller');
const { authenticateJWT, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// All business routes require authentication
router.use(authenticateJWT);

// GET /api/business/me
router.get('/me', getMyBusiness);

// PUT /api/business/me — managers only
router.put('/me', requireRole('MANAGER'), validate(schemas.updateBusiness), updateMyBusiness);

module.exports = router;