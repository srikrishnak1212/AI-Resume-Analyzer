'use strict';

/**
 * asyncHandler — Express async error wrapper
 * Wraps async route handlers to automatically catch rejected promises
 * and forward them to the centralized error-handling middleware.
 *
 * Usage:
 *   router.get('/resource', asyncHandler(async (req, res) => { ... }));
 *
 * Reference: Implementation-Guide.md §12.4
 */

/**
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
