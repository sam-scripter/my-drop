// user.routes.js

const router = require('express').Router();
const {
  createRider,
  getRiders,
  updateFcmToken,
  toggleRiderStatus
} = require('../controllers/user.controller');
const { authenticateJWT, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.use(authenticateJWT);

// POST /api/users/rider — managers only
router.post('/rider', requireRole('MANAGER'), validate(schemas.createRider), createRider);

// GET /api/users/riders — managers only
router.get('/riders', requireRole('MANAGER'), getRiders);

// PUT /api/users/fcm-token — riders and managers
router.put('/fcm-token', validate(schemas.updateFcmToken), updateFcmToken);

// PUT /api/users/riders/:id/toggle — managers only
router.put('/riders/:id/toggle', requireRole('MANAGER'), toggleRiderStatus);

module.exports = router;