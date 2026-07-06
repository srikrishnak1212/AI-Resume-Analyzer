'use strict';

/**
 * Dashboard Routes — /api/v1/dashboard
 *
 * GET /        — Retrieve consolidated dashboard summary
 * GET /recent  — Retrieve isolated recent uploads & activities
 *
 * Reference: API.md, Implementation-Guide.md
 */

const express = require('express');
const { protect } = require('../middlewares/auth');
const dashboardController = require('../controllers/dashboardController');
const { validateRecentQuery } = require('../validators/dashboardValidators');

const router = express.Router();

// All dashboard endpoints require authentication
router.use(protect);

router.get('/', dashboardController.getDashboardData);
router.get('/recent', validateRecentQuery, dashboardController.getRecentData);

module.exports = router;
