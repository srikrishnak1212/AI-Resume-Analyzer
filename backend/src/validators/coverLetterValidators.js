'use strict';

const { body, param, query } = require('express-validator');

const TONES = [
  'Professional',
  'Friendly',
  'Formal',
  'Executive',
  'Internship',
  'Graduate',
  'Technical',
  'Career Change',
];

const LENGTHS = ['Short', 'Medium', 'Long'];

const validateGenerateCoverLetter = [
  body('resumeId')
    .isMongoId()
    .withMessage('resumeId must be a valid MongoDB ObjectId'),
  body('jobDescriptionId')
    .optional()
    .isMongoId()
    .withMessage('jobDescriptionId must be a valid MongoDB ObjectId'),
  body('companyName')
    .notEmpty()
    .withMessage('companyName is required')
    .isString()
    .trim(),
  body('jobTitle')
    .notEmpty()
    .withMessage('jobTitle is required')
    .isString()
    .trim(),
  body('hiringManager')
    .optional()
    .isString()
    .trim(),
  body('tone')
    .isIn(TONES)
    .withMessage(`tone must be one of: ${TONES.join(', ')}`),
  body('length')
    .isIn(LENGTHS)
    .withMessage(`length must be one of: ${LENGTHS.join(', ')}`),
];

const validateCoverLetterId = [
  param('id')
    .isUUID()
    .withMessage('id must be a valid UUID'),
];

const validateCoverLetterQuery = [
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
  validateGenerateCoverLetter,
  validateCoverLetterId,
  validateCoverLetterQuery,
};
