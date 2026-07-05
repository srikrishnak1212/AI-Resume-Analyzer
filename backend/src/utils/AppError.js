'use strict';

/**
 * AppError — Operational error class.
 * Used throughout services to signal known, handled errors.
 * The error handler uses `err.isOperational` to distinguish
 * these from unexpected programming errors.
 *
 * Reference: Architecture.md §18
 */

class AppError extends Error {
  /**
   * @param {string} message - User-facing error message
   * @param {number} statusCode - HTTP status code (API.md §1.6)
   * @param {string} [code] - Machine-readable error code (API.md §13)
   * @param {object[]} [details] - Optional field-level validation details
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
