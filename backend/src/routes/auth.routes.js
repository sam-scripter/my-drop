// auth.routes.js — Maps URLs to auth controller functions

const router = require('express').Router();
const { register, login } = require('../controllers/auth.controller');
const { validate, schemas } = require('../middleware/validate');

// POST /api/auth/register
router.post('/register', validate(schemas.register), register);

// POST /api/auth/login
router.post('/login', validate(schemas.login), login);

module.exports = router;