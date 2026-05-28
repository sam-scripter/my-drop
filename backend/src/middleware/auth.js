// auth.js — Authentication and authorization middleware
//
// Middleware are functions that run BEFORE your route handler.
// Think of them as security guards at the door.
//
// authenticateJWT: checks that the request has a valid login token
// requireRole:     checks that the logged-in user has the right role

const { verifyToken } = require('../utils/jwt');

/**
 * Checks for a valid JWT in the Authorization header.
 * If valid, attaches the user info to req.user and calls next().
 * If invalid or missing, returns 401 Unauthorized.
 *
 * Usage: router.get('/protected', authenticateJWT, handler)
 *
 * The client sends: Authorization: Bearer <token>
 */
function authenticateJWT(req, res, next) {
  // Get the Authorization header e.g. "Bearer eyJhbGc..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: true,
      message: 'No token provided',
      code: 'UNAUTHORIZED'
    });
  }

  // Extract just the token part after "Bearer "
  const token = authHeader.substring(7);

  try {
    // Verify the token and decode its payload
    const decoded = verifyToken(token);

    // Attach user info to the request — available in all subsequent middleware
    // and route handlers as req.user
    req.user = {
      userId: decoded.userId,
      businessId: decoded.businessId,
      role: decoded.role,
    };

    next(); // pass control to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({
      error: true,
      message: 'Invalid or expired token',
      code: 'UNAUTHORIZED'
    });
  }
}

/**
 * Checks that the authenticated user has the required role.
 * Must be used AFTER authenticateJWT.
 *
 * Usage: router.post('/admin', authenticateJWT, requireRole('MANAGER'), handler)
 *
 * @param {...string} roles - one or more allowed roles e.g. 'MANAGER', 'RIDER'
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Not authenticated',
        code: 'UNAUTHORIZED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
        code: 'FORBIDDEN'
      });
    }

    next();
  };
}

module.exports = { authenticateJWT, requireRole };