'use strict';

/**
 * Resume Routes — /api/v1/resumes
 *
 * POST   /                  — Upload a resume (multipart/form-data)
 * GET    /                  — List authenticated user's resumes (paginated)
 * GET    /:resumeId         — Get resume detail
 * DELETE /:resumeId         — Soft-delete a resume
 *
 * Reference: API.md §3, Implementation-Guide.md Phase 3
 */

const express = require('express');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const resumeController = require('../controllers/resumeController');
const { validateResumeId, validateListQuery } = require('../validators/resumeValidators');

const router = express.Router();

// All resume routes require authentication
router.use(protect);

// ── Upload a resume ───────────────────────────────────────────────────────────
// multer processes the multipart body; the field name must be "resume"
router.post('/', upload.single('resume'), resumeController.uploadResume);

// ── List resumes ──────────────────────────────────────────────────────────────
router.get('/', validateListQuery, resumeController.listResumes);

// ── Get resume detail ─────────────────────────────────────────────────────────
router.get('/:resumeId', validateResumeId, resumeController.getResume);

// ── Delete resume ─────────────────────────────────────────────────────────────
router.delete('/:resumeId', validateResumeId, resumeController.deleteResume);

module.exports = router;
