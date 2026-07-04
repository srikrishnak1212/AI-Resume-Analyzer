'use strict';

/**
 * Auth Middleware — JWT Verification (Stub for Phase 1)
 * Verifies the JWT access token and attaches the decoded user to req.user.
 * Full implementation is in Phase 2.
 *
 * Reference: Architecture.md §7, API.md §1.4, Implementation-Guide.md §5.1
 */

// Phase 2: import jwtUtils and User model here
// const { verifyAccessToken } = require('../utils/jwtUtils');
// const User = require('../models/User');

const { sendError } = require('../utils/responseFormatter');

/**
 * Protect a route — requires a valid JWT access token.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
const protect = async (req, res, next) => {
  // Phase 2 implementation: extract Bearer token from Authorization header
  // or httpOnly cookie, verify signature, load user from DB, attach to req.user.
  // Stub returns 401 until auth is implemented.
  return sendError(res, {
    statusCode: 401,
    code: 'UNAUTHORIZED',
    message: 'Authentication is not yet implemented. This is a Phase 1 stub.',
  });
};

/**
 * Role-based access guard (to be used after `protect`).
 *
 * @param {...string} roles - Allowed roles (e.g., 'user', 'admin')
 * @returns {Function} Express middleware
 */
const requireRole = (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, {
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource.',
      });
    }
    next();
  };

module.exports = { protect, requireRole };
