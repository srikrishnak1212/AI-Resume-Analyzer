'use strict';

const { body, param, query } = require('express-validator');

const SECTIONS = [
  'Professional Summary',
  'Experience',
  'Projects',
  'Skills',
  'Education',
  'Achievements',
  'Certifications',
  'Entire Resume',
];

const MODES = [
  'Professional',
  'ATS Optimized',
  'Concise',
  'Detailed',
  'Executive',
  'Entry Level',
  'Technical',
  'Recruiter Friendly',
];

const validateTriggerRewrite = [
  body('resumeId')
    .isMongoId()
    .withMessage('resumeId must be a valid MongoDB ObjectId'),
  body('sectionName')
    .isIn(SECTIONS)
    .withMessage(`sectionName must be one of: ${SECTIONS.join(', ')}`),
  body('rewriteMode')
    .isIn(MODES)
    .withMessage(`rewriteMode must be one of: ${MODES.join(', ')}`),
  body('originalContent')
    .notEmpty()
    .withMessage('originalContent is required')
    .isLength({ min: 10 })
    .withMessage('originalContent must be at least 10 characters long'),
  body('improvements')
    .optional()
    .isArray()
    .withMessage('improvements must be an array of strings'),
];

const validateAcceptRejectRewrite = [
  body('rewriteId')
    .isUUID()
    .withMessage('rewriteId must be a valid UUID'),
];

const validateRewriteId = [
  param('id')
    .isUUID()
    .withMessage('id must be a valid UUID'),
];

const validateRewriteQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),
];

module.exports = {
  validateTriggerRewrite,
  validateAcceptRejectRewrite,
  validateRewriteId,
  validateRewriteQuery,
};
