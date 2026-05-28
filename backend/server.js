// server.js — Application entry point
// Starts the Express server and wires up all middleware and routes

require('dotenv').config(); // Load .env file into process.env first

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────
// These run on every request before it reaches any route handler

// helmet: adds security-related HTTP headers automatically
app.use(helmet());

// cors: allows the React web app and Flutter app to call this API
// from a different origin without the browser blocking it
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));

// morgan: logs every request to the console e.g. "GET /health 200 3ms"
app.use(morgan('dev'));

// Parse JSON request bodies — required for POST/PUT endpoints
app.use(express.json());

// ── Health check ────────────────────────────────────────────────────────
// Called by Nginx and UptimeRobot to confirm the API is alive
// No authentication required — completely public
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ── API root — placeholder until Phase 2 routes are added ──────────────
app.get('/api', (req, res) => {
  res.json({ message: 'mydrop API is running' });
});

// ── Global error handler ────────────────────────────────────────────────
// Any error passed to next(err) anywhere in the app lands here
// Ensures errors always return JSON, never an HTML error page
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