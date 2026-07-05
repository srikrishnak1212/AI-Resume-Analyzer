'use strict';

/**
 * Resume Validators — express-validator rules for resume routes.
 *
 * Reference: API.md §3, Implementation-Guide.md Phase 3
 * Rule: Validate every API (PROJECT_RULES.md)
 */

const { param, query } = require('express-validator');

/** Validate resumeId route param is a valid MongoDB ObjectId */
const validateResumeId = [
  param('resumeId')
    .isMongoId()
    .withMessage('resumeId must be a valid MongoDB ObjectId'),
];

/** Validate pagination query params for GET /resumes */
const validateListQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be between 1 and 50')
    .toInt(),
];

module.exports = { validateResumeId, validateListQuery };
