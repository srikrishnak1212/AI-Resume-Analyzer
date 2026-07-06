'use strict';

/**
 * API Router — Root index
 * Aggregates all resource routers under the /api/v1 prefix.
 * New routes are added here as phases are completed.
 *
 * Reference: Architecture.md §4.2, API.md §1.3
 */

const express = require('express');
const healthRouter = require('./health');

const router = express.Router();

// ─── Public routes ─────────────────────────────────────────────────────────────
router.use('/health', healthRouter);

// ─── Phase 2: Authentication ──────────────────────────────────────────────────
const authRouter = require('./auth');
router.use('/auth', authRouter);

// ─── Phase 3: Resumes ─────────────────────────────────────────────────────────
const resumesRouter = require('./resumes');
router.use('/resumes', resumesRouter);

// ─── Phase 4: AI Analysis ─────────────────────────────────────────────────────
const analysisRouter = require('./analysis');
router.use('/analysis', analysisRouter);

// ─── Phase 5: Reports & Analytics ────────────────────────────────────────────
const reportsRouter = require('./reports');
const analyticsRouter = require('./analytics');
router.use('/reports', reportsRouter);
router.use('/analytics', analyticsRouter);

// ─── Phase 6A: Dashboard Foundation ──────────────────────────────────────────
const dashboardRouter = require('./dashboard');
router.use('/dashboard', dashboardRouter);

// ─── Phase 6: Job Description Matching ───────────────────────────────────────
const jobMatchRouter = require('./jobMatch');
const jobDescriptionRouter = require('./jobDescription');
router.use('/job-match', jobMatchRouter);
router.use('/job-description', jobDescriptionRouter);

// ─── Phase 7: Enhancement Features ────────────────────────────────────────────
const rewriteRouter = require('./rewrite');
const coverLetterRouter = require('./coverLetter');
router.use('/resume-rewrite', rewriteRouter);
router.use('/cover-letter', coverLetterRouter);
// const interviewRouter = require('./interview');
// const careerRoadmapRouter = require('./careerRoadmap');
// router.use('/cover-letters', coverLettersRouter);
// router.use('/interview', interviewRouter);
// router.use('/career-roadmap', careerRoadmapRouter);

// ─── Phase 8: Profile & Settings ─────────────────────────────────────────────
// const profileRouter = require('./profile');
// const settingsRouter = require('./settings');
// router.use('/profile', profileRouter);
// router.use('/settings', settingsRouter);

module.exports = router;
