'use strict';

/**
 * Dashboard Validators — express-validator rules for dashboard routes.
 *
 * Reference: API.md, PROJECT_RULES.md (Validate every API)
 */

const { query } = require('express-validator');

/** Validate dashboard query parameters */
const validateRecentQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be between 1 and 50')
    .toInt(),
];

module.exports = {
  validateRecentQuery
};
