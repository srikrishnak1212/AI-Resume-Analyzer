'use strict';

/**
 * Standard API Response Formatter
 * Ensures all API responses follow a consistent JSON envelope.
 *
 * Success envelope:
 * { success: true, data: {...}, message?: '...', pagination?: {...} }
 *
 * Error envelope:
 * { success: false, error: { code: '...', message: '...', details?: [...] } }
 *
 * Reference: API.md §13, Implementation-Guide.md §12.4
 */

/**
 * Send a successful JSON response.
 *
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode=200]
 * @param {*} [options.data]
 * @param {string} [options.message]
 * @param {object} [options.pagination]
 */
const sendSuccess = (res, { statusCode = 200, data = null, message = null, pagination = null } = {}) => {
  const body = { success: true };

  if (data !== null) body.data = data;
  if (message) body.message = message;
  if (pagination) body.pagination = pagination;

  return res.status(statusCode).json(body);
};

/**
 * Send an error JSON response.
 *
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode=500]
 * @param {string} [options.code='INTERNAL_ERROR']
 * @param {string} [options.message='An unexpected error occurred.']
 * @param {Array} [options.details=[]]
 */
const sendError = (res, { statusCode = 500, code = 'INTERNAL_ERROR', message = 'An unexpected error occurred.', details = [] } = {}) => {
  const body = {
    success: false,
    error: { code, message },
  };

  if (details.length > 0) body.error.details = details;

  return res.status(statusCode).json(body);
};

/**
 * Build a pagination metadata object for list endpoints.
 *
 * @param {object} options
 * @param {number} options.page - Current page (1-indexed)
 * @param {number} options.limit - Items per page
 * @param {number} options.total - Total item count
 * @returns {object} pagination metadata
 */
const buildPagination = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = { sendSuccess, sendError, buildPagination };
