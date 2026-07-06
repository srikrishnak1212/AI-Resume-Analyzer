'use strict';

/**
 * Analysis Validators — express-validator rules for analysis routes.
 *
 * Reference: API.md §1.6, §4, PROJECT_RULES.md (Validate every API)
 */

const { param, query } = require('express-validator');

/** Validate resumeId route param is a valid MongoDB ObjectId */
const validateResumeId = [
  param('resumeId')
    .isMongoId()
    .withMessage('resumeId must be a valid MongoDB ObjectId'),
];

/** Validate analysisId route param is a valid MongoDB ObjectId */
const validateAnalysisId = [
  param('analysisId')
    .isMongoId()
    .withMessage('analysisId must be a valid MongoDB ObjectId'),
];

/** Validate pagination query parameters for list endpoints */
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

module.exports = {
  validateResumeId,
  validateAnalysisId,
  validateListQuery,
};
