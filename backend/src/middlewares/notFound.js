'use strict';

/**
 * 404 Not Found Handler
 * Catches all unmatched routes and returns a consistent 404 response.
 * Must be registered AFTER all valid routes, BEFORE the error handler.
 *
 * Reference: Architecture.md §18, Implementation-Guide.md §5.7
 */

const { sendError } = require('../utils/responseFormatter');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} _next
 */
const notFound = (req, res, _next) => {
  sendError(res, {
    statusCode: 404,
    code: 'NOT_FOUND',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = notFound;
