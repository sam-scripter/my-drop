// server.js — Application entry point
// Starts the Express server and wires up all middleware and routes

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security middleware ─────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
app.use(morgan('dev'));
app.use(express.json());

// Allow all origins for the public tracking endpoint
// For all other routes, restrict to known origins
app.use((req, res, next) => {
  if (req.path.startsWith('/api/track/')) {
    // Public tracking endpoint — allow any origin
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  } else {
    // All other routes — restrict to known origins
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
    })(req, res, next);
  }
});

app.use('/api/subscription', require('./src/routes/subscription.routes'));

app.use('/api/contact', require('./src/routes/contact.routes'));

app.use('/api/reports', require('./src/routes/reports.routes'))

// ── Rate limiting ───────────────────────────────────────────────────────
// Limits how many requests one IP can make — prevents abuse

// Strict limit for auth endpoints — prevents brute force password attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 attempts per 15 min per IP
  message: {
    error: true,
    message: 'Too many attempts, please try again later',
    code: 'RATE_LIMITED'
  }
});

// Looser limit for the public tracking endpoint
const trackingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,                  // max 100 requests per hour per IP
  message: {
    error: true,
    message: 'Too many requests',
    code: 'RATE_LIMITED'
  }
});

// ── Health check ────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ── Routes ──────────────────────────────────────────────────────────────
const { trackOrder } = require('./src/controllers/order.controller');

app.use('/api/auth', authLimiter, require('./src/routes/auth.routes'));
app.use('/api/business', require('./src/routes/business.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/orders', require('./src/routes/order.routes'));
app.use('/api/analytics', require('./src/routes/analytics.routes'));

// Public tracking endpoint — no JWT, rate limited separately
app.get('/api/track/:token', trackingLimiter, trackOrder);

// ── 404 handler ─────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND'
  });
});

// ── Global error handler ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

// ── Start server ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`mydrop API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});