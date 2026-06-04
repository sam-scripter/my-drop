// validate.js — Request body validation middleware
//
// We use Zod to define the shape of data we expect in each request.
// If the data doesn't match, we return a clear error before
// the request reaches the route handler.
//
// This prevents bad data from reaching the database and gives
// clients clear feedback on what's wrong.

const { z } = require('zod');

/**
 * Creates a middleware that validates req.body against a Zod schema.
 * If validation fails, returns 400 with details of what's wrong.
 * If validation passes, replaces req.body with the parsed (cleaned) data.
 *
 * @param {z.ZodSchema} schema - Zod schema to validate against
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Format Zod errors into a readable list
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors,
      });
    }

    // Replace req.body with the validated and cleaned data
    req.body = result.data;
    next();
  };
}

// ── Schemas ─────────────────────────────────────────────────────────────
// Define the expected shape of each request body here

const { z: zod } = require('zod');

const schemas = {
  // POST /api/auth/register
 register: zod.object({
  businessName: zod.string().min(2, 'Business name must be at least 2 characters'),
  businessPhone: zod.string().min(10, 'Enter a valid phone number'),
  businessEmail: zod.string().email('Enter a valid email address'),
  managerName: zod.string().min(2, 'Name must be at least 2 characters'),
  password: zod.string().min(8, 'Password must be at least 8 characters'),
  businessType: zod.enum(['FOOD', 'RETAIL', 'PHARMACY', 'COURIER', 'OTHER']).default('OTHER'),
}),

  // POST /api/auth/login
  login: zod.object({
    email: zod.string().email('Enter a valid email address'),
    password: zod.string().min(1, 'Password is required'),
  }),

  // POST /api/auth/forgot-password
  forgotPassword: zod.object({
    email: zod.string().email('Enter a valid email address'),
  }),

  // POST /api/auth/reset-password
  resetPassword: zod.object({
    token: zod.string().min(1, 'Token is required'),
    newPassword: zod.string().min(8, 'Password must be at least 8 characters'),
  }),

  // PUT /api/users/change-password
  changePassword: zod.object({
    currentPassword: zod.string().min(1, 'Current password is required'),
    newPassword: zod.string().min(8, 'New password must be at least 8 characters'),
  }),

  // PUT /api/business/me
  updateBusiness: zod.object({
    name: zod.string().min(2).optional(),
    phone: zod.string().min(10).optional(),
    logo_url: zod.string().url().optional(),
    address: zod.string().optional(),
  }),

  // POST /api/users/rider
  createRider: zod.object({
    name: zod.string().min(2, 'Name must be at least 2 characters'),
    phone: zod.string().min(10, 'Enter a valid phone number'),
    email: zod.string().email('Enter a valid email address'),
  }),

  // POST /api/orders
  createOrder: zod.object({
    customer_name: zod.string().min(2, 'Customer name is required'),
    customer_phone: zod.string().min(10, 'Enter a valid phone number'),
    customer_address: zod.string().min(5, 'Delivery address is required'),
    items_description: zod.string().optional(),
    notes: zod.string().optional(),
    delivery_lat: zod.number().optional().nullable(),   // ← add
    delivery_lng: zod.number().optional().nullable(), 
    source: zod.enum(['manual', 'whatsapp', 'api', 'pos']).default('manual'),
    source_ref: zod.string().optional(),
  }),

  // POST /api/orders/:id/assign
  assignRider: zod.object({
    riderId: zod.string().min(1, 'Rider ID is required'),
  }),

  // PUT /api/orders/:id/status
  updateStatus: zod.object({
    status: zod.enum(['PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED']),
    pin: zod.string().length(4).optional(), // required when status is DELIVERED
  }),

  // PUT /api/orders/:id/rate
  rateDelivery: zod.object({
    rating: zod.number().int().min(1).max(5),
    rating_note: zod.string().optional(),
  }),

  // PUT /api/users/fcm-token
  updateFcmToken: zod.object({
    fcm_token: zod.string().min(1, 'FCM token is required'),
  }),
};

module.exports = { validate, schemas };