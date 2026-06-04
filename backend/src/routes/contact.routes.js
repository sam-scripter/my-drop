// contact.routes.js — Public contact form endpoint
const router = require('express').Router();
const { submitContact } = require('../controllers/contact.controller');

// POST /api/contact — no auth required, public form
router.post('/', submitContact);

module.exports = router;