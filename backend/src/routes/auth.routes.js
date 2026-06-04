// auth.routes.js — Maps URLs to auth controller functions

const router = require('express').Router();
const { register, login, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { validate, schemas } = require('../middleware/validate');
const { sendContactEmail } = require('../controllers/contact.controller');

// POST /api/auth/register
router.post('/register', validate(schemas.register), register);

// POST /api/auth/login
router.post('/login', validate(schemas.login), login);

// POST /api/auth/forgot-password
// Sends a reset link to the provided email address
router.post('/forgot-password', validate(schemas.forgotPassword), forgotPassword);

// POST /api/auth/reset-password
// Validates the token and sets a new password
router.post('/reset-password', validate(schemas.resetPassword), resetPassword);

// POST /api/contact — public contact form submission
router.post('/contact', sendContactEmail);

module.exports = router;