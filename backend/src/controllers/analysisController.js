'use strict';

/**
 * Analysis Controller — thin HTTP layer for /api/v1/analysis routes.
 * Delegates all business logic to analysisService.
 *
 * Reference: API.md §4, Architecture.md §4.1 (controller pattern)
 * Rule: Controllers remain thin (PROJECT_RULES.md)
 */

const { validationResult } = require('express-validator');
const analysisService = require('../services/analysisService');
const { sendSuccess, buildPagination } = require('../utils/responseFormatter');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw new AppError('Validation failed.', 400, 'VALIDATION_ERROR', details);
  }
};

// ─── Trigger Resume Analysis ──────────────────────────────────────────────────

const triggerAnalysis = asyncHandler(async (req, res) => {
  checkValidation(req);

  const analysis = await analysisService.startAnalysis(req.params.resumeId, req.user._id);

  // Return 201 Created with safe public representations
  return sendSuccess(res, {
    statusCode: 201,
    data: {
      analysis: analysis.toPublicJSON ? analysis.toPublicJSON() : analysis,
    },
    message: 'Analysis job triggered successfully.',
  });
});

// ─── Get Analysis Details ─────────────────────────────────────────────────────

const getAnalysis = asyncHandler(async (req, res) => {
  checkValidation(req);

  const analysis = await analysisService.getAnalysisByResumeId(req.params.resumeId, req.user._id);

  return sendSuccess(res, {
    data: {
      analysis: analysis.toPublicJSON ? analysis.toPublicJSON() : analysis,
    },
  });
});

// ─── Get Analysis History ─────────────────────────────────────────────────────

const getHistory = asyncHandler(async (req, res) => {
  checkValidation(req);

  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const { analyses, total } = await analysisService.getUserAnalysisHistory({
    userId: req.user._id,
    page: Number(page),
    limit: Number(limit),
  });

  return sendSuccess(res, {
    data: { analyses },
    pagination: buildPagination({ page: Number(page), limit: Number(limit), total }),
  });
});

// ─── Delete Analysis ──────────────────────────────────────────────────────────

const deleteAnalysis = asyncHandler(async (req, res) => {
  checkValidation(req);

  await analysisService.deleteAnalysis(req.params.analysisId, req.user._id);

  return res.status(204).end();
});

module.exports = {
  triggerAnalysis,
  getAnalysis,
  getHistory,
  deleteAnalysis,
};
