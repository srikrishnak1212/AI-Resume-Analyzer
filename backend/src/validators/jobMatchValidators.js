'use strict';

const { body, param, query } = require('express-validator');

const validateJobDescriptionText = [
  body('text')
    .notEmpty()
    .withMessage('Job description text is required')
    .isLength({ min: 50 })
    .withMessage('Job description text must be at least 50 characters long'),
  body('jobTitle')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Job title cannot exceed 150 characters'),
  body('companyName')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Company name cannot exceed 150 characters'),
];

const validateJobMatchCreate = [
  body('resumeId')
    .isMongoId()
    .withMessage('resumeId must be a valid MongoDB ObjectId'),
  body('jobDescriptionId')
    .isMongoId()
    .withMessage('jobDescriptionId must be a valid MongoDB ObjectId'),
];

const validateMatchId = [
  param('id')
    .isUUID()
    .withMessage('id must be a valid UUID v4 identifier'),
];

const validateListQuery = [
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
  validateJobDescriptionText,
  validateJobMatchCreate,
  validateMatchId,
  validateListQuery,
};
