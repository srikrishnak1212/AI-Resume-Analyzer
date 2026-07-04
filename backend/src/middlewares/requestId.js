'use strict';

/**
 * Request ID Middleware
 * Attaches a unique UUID to every incoming request as `req.id`.
 * Also sets the `X-Request-ID` response header for client-side log correlation.
 *
 * If the client sends an `X-Request-ID` header, that value is used (and validated);
 * otherwise a new UUID v4 is generated.
 *
 * Reference: API.md §1.5, Architecture.md §17, Implementation-Guide.md §5.7
 */

const { v4: uuidv4 } = require('uuid');

/**
 * UUID v4 validation regex
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
const requestId = (req, res, next) => {
  const clientId = req.headers['x-request-id'];

  // Accept client-provided ID only if it's a valid UUID
  req.id = clientId && UUID_REGEX.test(clientId) ? clientId : uuidv4();

  // Echo the ID back to the client
  res.setHeader('X-Request-ID', req.id);

  next();
};

module.exports = requestId;
