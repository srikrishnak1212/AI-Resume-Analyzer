'use strict';

/**
 * Report Validators
 * Enforces correct format for route params and pagination options.
 *
 * Reference: PROJECT_RULES.md (Validate every API)
 */

const { param, query, body } = require('express-validator');

const validateReportId = [
  param('reportId')
    .isString()
    .notEmpty()
    .withMessage('reportId must be a non-empty string'),
];

const validateGenerateReport = [
  body('analysisId')
    .isMongoId()
    .withMessage('analysisId must be a valid MongoDB ObjectId'),
];

const validateReportsQuery = [
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

module.exports = {
  validateReportId,
  validateGenerateReport,
  validateReportsQuery,
};
