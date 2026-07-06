'use strict';

/**
 * JobMatch Routes — /api/v1/job-match
 */

const express = require('express');
const { protect } = require('../middlewares/auth');
const jobMatchController = require('../controllers/jobMatchController');
const {
  validateJobMatchCreate,
  validateMatchId,
  validateListQuery,
} = require('../validators/jobMatchValidators');

const router = express.Router();

// All routes require authentication
router.use(protect);

// ── Match operations ──────────────────────────────────────────────────────────
router.post(
  '/',
  validateJobMatchCreate,
  jobMatchController.createMatch
);

router.get(
  '/history',
  validateListQuery,
  jobMatchController.listMatches
);

router.get(
  '/:id',
  validateMatchId,
  jobMatchController.getMatch
);

router.delete(
  '/:id',
  validateMatchId,
  jobMatchController.deleteMatch
);

module.exports = router;
