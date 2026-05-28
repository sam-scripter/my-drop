// order.routes.js

const router = require('express').Router();
const {
  createOrder,
  getOrders,
  getOrder,
  assignRider,
  updateStatus,
  rateDelivery,
} = require('../controllers/order.controller');
const { authenticateJWT, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.use(authenticateJWT);

// POST /api/orders
router.post('/', requireRole('MANAGER'), validate(schemas.createOrder), createOrder);

// GET /api/orders
router.get('/', getOrders);

// GET /api/orders/:id
router.get('/:id', getOrder);

// POST /api/orders/:id/assign — managers only
router.post('/:id/assign', requireRole('MANAGER'), validate(schemas.assignRider), assignRider);

// PUT /api/orders/:id/status — riders and managers
router.put('/:id/status', validate(schemas.updateStatus), updateStatus);

// PUT /api/orders/:id/rate — no role restriction, called from tracking page
router.put('/:id/rate', validate(schemas.rateDelivery), rateDelivery);

module.exports = router;