'use strict';

/**
 * Report Routes — /api/v1/reports
 *
 * GET    /                     — List reports (paginated)
 * POST   /                     — Generate/fetch report from analysisId
 * GET    /:reportId            — Get specific report metadata
 * GET    /download/pdf/:reportId — Download report PDF binary
 * GET    /download/json/:reportId — Download report JSON text
 * POST   /regenerate/:reportId — Force regenerate PDF/JSON files
 * DELETE /:reportId            — Delete report DB entry and files
 *
 * Reference: API.md, Phase 6C Spec
 */

const express = require('express');
const { protect } = require('../middlewares/auth');
const reportController = require('../controllers/reportController');
const {
  validateReportId,
  validateGenerateReport,
  validateReportsQuery,
} = require('../validators/reportValidators');

const router = express.Router();

// All routes require authentication
router.use(protect);

// List reports
router.get('/', validateReportsQuery, reportController.getReports);

// Generate/fetch report from analysisId
router.post('/', validateGenerateReport, reportController.generateReport);

// Get specific report metadata
router.get('/:reportId', validateReportId, reportController.getReport);

// Download PDF file
router.get('/download/pdf/:reportId', validateReportId, reportController.downloadPDF);

// Download JSON file
router.get('/download/json/:reportId', validateReportId, reportController.downloadJSON);

// Force regenerate report files
router.post('/regenerate/:reportId', validateReportId, reportController.regenerateReport);

// Delete report
router.delete('/:reportId', validateReportId, reportController.deleteReport);

module.exports = router;
