'use strict';

/**
 * Centralized Error Handling Middleware
 * Maps all internal errors to standardized HTTP responses.
 * No stack traces are ever returned to the client in production.
 *
 * Reference: API.md §1.6 (HTTP status codes), Architecture.md §18,
 *            Implementation-Guide.md §5.7, §12.4
 */

const config = require('../config/env');
const logger = require('../utils/logger');
const { sendError } = require('../utils/responseFormatter');

// ─── Error code → HTTP status mapping ─────────────────────────────────────────
const ERROR_MAP = {
  ValidationError: { statusCode: 400, code: 'VALIDATION_ERROR' },
  CastError: { statusCode: 400, code: 'INVALID_ID' },
  UnauthorizedError: { statusCode: 401, code: 'UNAUTHORIZED' },
  ForbiddenError: { statusCode: 403, code: 'FORBIDDEN' },
  NotFoundError: { statusCode: 404, code: 'NOT_FOUND' },
  ConflictError: { statusCode: 409, code: 'CONFLICT' },
  PayloadTooLargeError: { statusCode: 413, code: 'PAYLOAD_TOO_LARGE' },
  UnsupportedMediaTypeError: { statusCode: 415, code: 'UNSUPPORTED_MEDIA_TYPE' },
  AIServiceError: { statusCode: 503, code: 'AI_SERVICE_UNAVAILABLE' },
};

/**
 * Global Express error handler.
 * Must be registered LAST, after all routes.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
const errorHandler = (err, req, res, next) => {
  // ── Log the error ────────────────────────────────────────────────────────────
  logger.error({
    message: err.message,
    name: err.name,
    path: req.path,
    method: req.method,
    requestId: req.id,
    stack: config.isDevelopment ? err.stack : undefined,
  });

  // ── Mongoose duplicate key error (11000) ─────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return sendError(res, {
      statusCode: 409,
      code: 'CONFLICT',
      message: `A record with this ${field} already exists.`,
    });
  }

  // ── Mongoose validation error ─────────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed.',
      details,
    });
  }

  // ── JWT errors ────────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, { statusCode: 401, code: 'INVALID_TOKEN', message: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, { statusCode: 401, code: 'TOKEN_EXPIRED', message: 'Token has expired.' });
  }

  // ── Multer errors ─────────────────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, { statusCode: 413, code: 'FILE_TOO_LARGE', message: 'File size exceeds the 5MB limit.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return sendError(res, { statusCode: 400, code: 'UNEXPECTED_FILE', message: 'Unexpected file field in request.' });
  }

  // ── Mapped custom errors ──────────────────────────────────────────────────────
  const mapped = ERROR_MAP[err.name];
  if (mapped) {
    return sendError(res, {
      statusCode: mapped.statusCode,
      code: mapped.code,
      message: err.message || 'An error occurred.',
    });
  }

  // ── Fallback: 500 Internal Server Error ───────────────────────────────────────
  return sendError(res, {
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    message: config.isProduction
      ? 'An unexpected error occurred. Please try again later.'
      : err.message,
  });
};

module.exports = errorHandler;
