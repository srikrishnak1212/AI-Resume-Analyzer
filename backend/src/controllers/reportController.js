'use strict';

/**
 * Report Controller
 * Maps HTTP requests to the reportService.
 *
 * Reference: Architecture.md §4.1 (controller pattern)
 * Rule: Keep controllers thin (PROJECT_RULES.md)
 */

const { validationResult } = require('express-validator');
const reportService = require('../services/reportService');
const { sendSuccess } = require('../utils/responseFormatter');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw new AppError('Validation failed.', 400, 'VALIDATION_ERROR', details);
  }
};

/**
 * GET /api/v1/reports
 */
const getReports = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { page, limit } = req.query;
  const result = await reportService.listReports(req.user._id, page, limit);
  return sendSuccess(res, { data: result });
});

/**
 * GET /api/v1/reports/:reportId
 */
const getReport = asyncHandler(async (req, res) => {
  checkValidation(req);
  const report = await reportService.getReport(req.params.reportId, req.user._id);
  return sendSuccess(res, { data: { report } });
});

/**
 * POST /api/v1/reports
 */
const generateReport = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { analysisId } = req.body;
  const report = await reportService.getReportOrCreate(analysisId, req.user._id);
  return sendSuccess(res, {
    statusCode: 201,
    data: { report },
    message: 'Report processed successfully.'
  });
});

/**
 * GET /api/v1/reports/download/pdf/:reportId
 */
const downloadPDF = asyncHandler(async (req, res) => {
  checkValidation(req);
  const filePath = await reportService.downloadPDF(req.params.reportId, req.user._id);
  
  // Set attachment headers for downloading
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Resume_Report_${req.params.reportId}.pdf"`);
  
  return res.sendFile(filePath);
});

/**
 * GET /api/v1/reports/download/json/:reportId
 */
const downloadJSON = asyncHandler(async (req, res) => {
  checkValidation(req);
  const filePath = await reportService.downloadJSON(req.params.reportId, req.user._id);
  
  // Set attachment headers for downloading
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="Resume_Report_${req.params.reportId}.json"`);
  
  return res.sendFile(filePath);
});

/**
 * POST /api/v1/reports/regenerate/:reportId
 */
const regenerateReport = asyncHandler(async (req, res) => {
  checkValidation(req);
  const report = await reportService.regenerateReport(req.params.reportId, req.user._id);
  return sendSuccess(res, {
    statusCode: 200,
    data: { report },
    message: 'Report regenerated successfully.'
  });
});

/**
 * DELETE /api/v1/reports/:reportId
 */
const deleteReport = asyncHandler(async (req, res) => {
  checkValidation(req);
  await reportService.deleteReport(req.params.reportId, req.user._id);
  return res.status(204).end();
});

module.exports = {
  getReports,
  getReport,
  generateReport,
  downloadPDF,
  downloadJSON,
  regenerateReport,
  deleteReport
};
