'use strict';

/**
 * Rate Limiter Middleware
 * Configures tiered rate limits:
 *   - General API: 100 req/min per IP
 *   - Auth endpoints: 5 req/min per IP (brute-force protection)
 *   - AI-triggering endpoints: 3 req/min per user (cost control)
 *
 * Reference: SRS §19, Architecture.md §6.7, API.md §18,
 *            Implementation-Guide.md §5.7
 */

const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const { sendError } = require('../utils/responseFormatter');

// ─── Shared rate limit response handler ───────────────────────────────────────
const rateLimitHandler = (_req, res) => {
  sendError(res, {
    statusCode: 429,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please wait before trying again.',
  });
};

// ─── General API rate limiter ─────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: () => config.isTest,
});

// ─── Auth endpoints rate limiter (stricter) ───────────────────────────────────
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: () => config.isTest,
  keyGenerator: (req) => req.ip,
});

// ─── AI-triggering endpoints rate limiter (cost control) ─────────────────────
const aiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.aiMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: () => config.isTest,
  // Key by user ID when available, fall back to IP
  keyGenerator: (req) => (req.user ? req.user._id.toString() : req.ip),
});

module.exports = { generalLimiter, authLimiter, aiLimiter };
