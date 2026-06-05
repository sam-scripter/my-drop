// reports.routes.js — Reporting and analytics endpoints

const router = require('express').Router()
const { getReports } = require('../controllers/reports.controller')
const { authenticateJWT, requireRole } = require('../middleware/auth')

router.use(authenticateJWT)

// GET /api/reports?period=today|week|month
router.get('/', requireRole('MANAGER'), getReports)

module.exports = router