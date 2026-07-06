'use strict';

/**
 * Analytics Validators — express-validator rules for analytics routes.
 *
 * Reference: API.md, PROJECT_RULES.md (Validate every API)
 */

const { param, query } = require('express-validator');

const sanitizeEmpty = (val) => (val === '' ? undefined : val);

/** Validate optional query parameters on analytics lists */
const validateAnalyticsQuery = [
  query('resumeId')
    .customSanitizer(sanitizeEmpty)
    .optional()
    .isMongoId()
    .withMessage('resumeId must be a valid MongoDB ObjectId'),

  query('startDate')
    .customSanitizer(sanitizeEmpty)
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO8601 date string'),

  query('endDate')
    .customSanitizer(sanitizeEmpty)
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO8601 date string'),

  query('minScore')
    .customSanitizer(sanitizeEmpty)
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('minScore must be an integer between 0 and 100')
    .toInt(),

  query('maxScore')
    .customSanitizer(sanitizeEmpty)
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('maxScore must be an integer between 0 and 100')
    .toInt(),

  query('page')
    .customSanitizer(sanitizeEmpty)
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer')
    .toInt(),

  query('limit')
    .customSanitizer(sanitizeEmpty)
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be between 1 and 50')
    .toInt(),
];

/** Validate comparison resumeId route parameter */
const validateComparisonParam = [
  param('resumeId')
    .isMongoId()
    .withMessage('resumeId parameter must be a valid MongoDB ObjectId'),
];

module.exports = {
  validateAnalyticsQuery,
  validateComparisonParam
};
