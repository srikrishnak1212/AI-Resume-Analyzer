'use strict';

/**
 * Auth Middleware — JWT Verification
 * Verifies the JWT access token from Authorization header or HTTP-only cookie.
 * Attaches the decoded user document to req.user.
 *
 * Reference: Architecture.md §7, API.md §1.4
 */

const { verifyAccessToken } = require('../utils/jwtUtils');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Protect a route — requires a valid JWT access token.
 * Reads the token from:
 *   1. Authorization: Bearer <token> header (preferred for API clients)
 *   2. accessToken cookie (browser SPA clients)
 */
const protect = async (req, _res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401, 'MISSING_TOKEN'));
    }

    const decoded = verifyAccessToken(token);

    // Load the full user document (excludes password fields by default)
    const user = await User.findOne({
      _id: decoded.userId,
      isDeleted: false,
      isActive: true,
    });

    if (!user) {
      return next(new AppError('User account not found or deactivated.', 401, 'INVALID_TOKEN'));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Access token has expired. Please refresh your session.', 401, 'TOKEN_EXPIRED'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid access token.', 401, 'INVALID_TOKEN'));
    }
    next(err);
  }
};

/**
 * Optional auth — attaches user to req.user if a valid token is present,
 * but does NOT block the request if no token is provided.
 * Useful for routes that behave differently for authenticated vs. anonymous users.
 */
const optionalProtect = async (req, _res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) return next();

    const decoded = verifyAccessToken(token);
    const user = await User.findOne({ _id: decoded.userId, isDeleted: false, isActive: true });
    if (user) req.user = user;
  } catch {
    // Ignore token errors for optional auth
  }
  next();
};

/**
 * Role-based access guard (use AFTER `protect`).
 * @param {...string} roles - Allowed roles, e.g. 'admin'
 */
const requireRole = (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to access this resource.', 403, 'FORBIDDEN'));
    }
    next();
  };

module.exports = { protect, optionalProtect, requireRole };
