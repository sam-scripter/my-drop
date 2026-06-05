// user.routes.js

const router = require('express').Router();
const {
  createRider,
  getRiders,
  updateFcmToken,
  toggleRiderStatus,
  changePassword,
  updateProfile,
} = require('../controllers/user.controller');
const { authenticateJWT, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { checkRiderLimit } = require('../middleware/subscription');

router.use(authenticateJWT);

// POST /api/users/rider — managers only
router.post('/rider', requireRole('MANAGER'), checkRiderLimit, validate(schemas.createRider), createRider);

// GET /api/users/riders — managers only
router.get('/riders', requireRole('MANAGER'), getRiders);

// PUT /api/users/fcm-token — riders and managers
router.put('/fcm-token', validate(schemas.updateFcmToken), updateFcmToken);

// PUT /api/users/riders/:id/toggle — managers only
router.put('/riders/:id/toggle', requireRole('MANAGER'), toggleRiderStatus);

// PUT /api/users/change-password — logged in user changes their own password
router.put('/change-password', validate(schemas.changePassword), changePassword);

// PUT /api/users/me — update own profile
router.put('/me', updateProfile);

module.exports = router;