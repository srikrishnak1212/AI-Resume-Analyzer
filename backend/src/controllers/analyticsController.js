'use strict';

/**
 * Analytics Controller
 * Thin HTTP layer for /api/v1/analytics endpoints.
 * Delegates all business logic to analyticsService.
 *
 * Reference: API.md, Architecture.md §4.1 (controller pattern)
 * Rule: Controllers remain thin (PROJECT_RULES.md)
 */

const { validationResult } = require('express-validator');
const analyticsService = require('../services/analyticsService');
const { sendSuccess } = require('../utils/responseFormatter');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Helper to check route validation results
const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw new AppError('Validation failed.', 400, 'VALIDATION_ERROR', details);
  }
};

/**
 * Extract filters from query parameters
 *
 * @param {object} query - Request query object
 * @returns {object} Extracted filter values
 * @private
 */
const _extractFilters = (query) => {
  const filters = {};
  
  if (query.resumeId && query.resumeId.toString().trim() !== '') {
    filters.resumeId = query.resumeId;
  }
  if (query.startDate && query.startDate.toString().trim() !== '') {
    filters.startDate = query.startDate;
  }
  if (query.endDate && query.endDate.toString().trim() !== '') {
    filters.endDate = query.endDate;
  }
  
  if (query.minScore !== undefined && query.minScore !== '' && !isNaN(Number(query.minScore))) {
    filters.minScore = parseInt(query.minScore, 10);
  }
  if (query.maxScore !== undefined && query.maxScore !== '' && !isNaN(Number(query.maxScore))) {
    filters.maxScore = parseInt(query.maxScore, 10);
  }

  return filters;
};

/**
 * GET /api/v1/analytics - Overview summary of all metrics
 */
const getSummary = asyncHandler(async (req, res) => {
  checkValidation(req);
  const filters = _extractFilters(req.query);

  const data = await analyticsService.getAnalyticsSummary(req.user._id, filters);

  return sendSuccess(res, {
    statusCode: 200,
    data,
    message: 'Analytics summary stats compiled successfully.'
  });
});

/**
 * GET /api/v1/analytics/history - Paginated analysis history log
 */
const getHistory = asyncHandler(async (req, res) => {
  checkValidation(req);
  const filters = _extractFilters(req.query);
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await analyticsService.getAnalyticsHistory(req.user._id, filters, page, limit);

  return sendSuccess(res, {
    statusCode: 200,
    data: { analyses: result.analyses },
    pagination: result.pagination,
    message: 'Analytics history timeline retrieved successfully.'
  });
});

/**
 * GET /api/v1/analytics/trends - Version scores progression data over time
 */
const getTrends = asyncHandler(async (req, res) => {
  checkValidation(req);
  const filters = _extractFilters(req.query);

  const data = await analyticsService.getAnalyticsTrends(req.user._id, filters);

  return sendSuccess(res, {
    statusCode: 200,
    data,
    message: 'Analytics progression trends compiled successfully.'
  });
});

/**
 * GET /api/v1/analytics/comparison/:resumeId - Score comparison delta analysis
 */
const getComparison = asyncHandler(async (req, res) => {
  checkValidation(req);
  
  const data = await analyticsService.getAnalyticsComparison(req.user._id, req.params.resumeId);

  return sendSuccess(res, {
    statusCode: 200,
    data,
    message: 'Version comparison deltas resolved successfully.'
  });
});

/**
 * GET /api/v1/analytics/skills - Radar chart stats and keywords distribution lists
 */
const getSkills = asyncHandler(async (req, res) => {
  checkValidation(req);
  const resumeId = req.query.resumeId || null;

  const data = await analyticsService.getSkillsAnalytics(req.user._id, resumeId);

  return sendSuccess(res, {
    statusCode: 200,
    data,
    message: 'Skills and keywords analytics datasets resolved successfully.'
  });
});

module.exports = {
  getSummary,
  getHistory,
  getTrends,
  getComparison,
  getSkills
};
