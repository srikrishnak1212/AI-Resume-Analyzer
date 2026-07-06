'use strict';

/**
 * Analytics Routes — /api/v1/analytics
 *
 * GET /                    — Summary stats overview
 * GET /history             — Paginated analysis run history log
 * GET /trends              — Score progression timeline
 * GET /comparison/:resumeId — Side-by-side comparison report
 * GET /skills              — Radar mapping & keyword distributions
 *
 * Reference: API.md, Implementation-Guide.md
 */

const express = require('express');
const { protect } = require('../middlewares/auth');
const analyticsController = require('../controllers/analyticsController');
const {
  validateAnalyticsQuery,
  validateComparisonParam
} = require('../validators/analyticsValidators');

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

router.get('/', validateAnalyticsQuery, analyticsController.getSummary);
router.get('/history', validateAnalyticsQuery, analyticsController.getHistory);
router.get('/trends', validateAnalyticsQuery, analyticsController.getTrends);
router.get('/comparison/:resumeId', validateComparisonParam, analyticsController.getComparison);
router.get('/skills', validateAnalyticsQuery, analyticsController.getSkills);

module.exports = router;
