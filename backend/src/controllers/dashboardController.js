'use strict';

/**
 * Dashboard Controller
 * Thin HTTP layer for /api/v1/dashboard routes.
 * Delegates all business logic to dashboardService.
 *
 * Reference: API.md, Architecture.md §4.1 (controller pattern)
 * Rule: Controllers remain thin (PROJECT_RULES.md)
 */

const { validationResult } = require('express-validator');
const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/responseFormatter');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Helper to check route validations
const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw new AppError('Validation failed.', 400, 'VALIDATION_ERROR', details);
  }
};

/**
 * Get dashboard overview statistics and metrics
 */
const getDashboardData = asyncHandler(async (req, res) => {
  const data = await dashboardService.getUserDashboardStats(req.user._id);

  return sendSuccess(res, {
    statusCode: 200,
    data,
    message: 'Dashboard metrics compiled successfully.'
  });
});

/**
 * Get recent uploads, analyses, and activities
 */
const getRecentData = asyncHandler(async (req, res) => {
  checkValidation(req);

  const limit = req.query.limit || 5;
  const data = await dashboardService.getRecentActivities(req.user._id, limit);

  return sendSuccess(res, {
    statusCode: 200,
    data,
    message: 'Recent dashboard datasets retrieved successfully.'
  });
});

module.exports = {
  getDashboardData,
  getRecentData
};
