'use strict';

/**
 * Analysis Routes — /api/v1/analysis
 *
 * POST   /:resumeId         — Trigger AI resume analysis
 * GET    /history           — List authenticated user's analysis history (paginated)
 * GET    /:resumeId         — Retrieve analysis detail for a resume
 * DELETE /:analysisId       — Soft-delete an analysis
 *
 * Reference: API.md §4, Implementation-Guide.md Phase 4
 */

const express = require('express');
const { protect } = require('../middlewares/auth');
const analysisController = require('../controllers/analysisController');
const {
  validateResumeId,
  validateAnalysisId,
  validateListQuery,
} = require('../validators/analysisValidators');

const router = express.Router();

// All analysis routes require authentication
router.use(protect);

// ── GET analysis history (MUST be registered before dynamic parameter routes) ────
router.get('/history', validateListQuery, analysisController.getHistory);

// ── Trigger analysis for a resume ─────────────────────────────────────────────
router.post('/:resumeId', validateResumeId, analysisController.triggerAnalysis);

// ── Get analysis detail for a resume ──────────────────────────────────────────
router.get('/:resumeId', validateResumeId, analysisController.getAnalysis);

// ── Delete analysis ───────────────────────────────────────────────────────────
router.delete('/:analysisId', validateAnalysisId, analysisController.deleteAnalysis);

module.exports = router;
