'use strict';

/**
 * Resume Controller — thin HTTP layer for /api/v1/resumes routes.
 * Delegates all business logic to resumeService.
 *
 * Reference: API.md §3, Architecture.md §4.1 (controller pattern)
 * Rule: Controllers remain thin (PROJECT_RULES.md)
 */

const { validationResult } = require('express-validator');
const resumeService = require('../services/resumeService');
const { sendSuccess, buildPagination } = require('../utils/responseFormatter');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// ── Helpers ────────────────────────────────────────────────────────────────────

const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw new AppError('Validation failed.', 400, 'VALIDATION_ERROR', details);
  }
};

// ── POST /api/v1/resumes — Upload a resume ────────────────────────────────────

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file provided. Please attach a PDF or DOCX file.', 400, 'NO_FILE');
  }

  const resume = await resumeService.uploadResume({
    userId: req.user._id,
    multerFile: req.file,
    versionLabel: req.body.versionLabel || null,
  });

  return sendSuccess(res, {
    statusCode: 201,
    data: { resume: resume.toPublicJSON ? resume.toPublicJSON() : resume },
    message: 'Resume uploaded successfully.',
  });
});

// ── GET /api/v1/resumes — List user's resumes ─────────────────────────────────

const listResumes = asyncHandler(async (req, res) => {
  checkValidation(req);

  const page  = req.query.page  || 1;
  const limit = req.query.limit || 10;

  const { resumes, total } = await resumeService.listResumes({
    userId: req.user._id,
    page: Number(page),
    limit: Number(limit),
  });

  return sendSuccess(res, {
    data: { resumes },
    pagination: buildPagination({ page: Number(page), limit: Number(limit), total }),
  });
});

// ── GET /api/v1/resumes/:resumeId — Get resume detail ─────────────────────────

const getResume = asyncHandler(async (req, res) => {
  checkValidation(req);

  const resume = await resumeService.getResumeById(req.params.resumeId, req.user._id);

  return sendSuccess(res, { data: { resume } });
});

// ── DELETE /api/v1/resumes/:resumeId — Soft-delete a resume ──────────────────

const deleteResume = asyncHandler(async (req, res) => {
  checkValidation(req);

  await resumeService.deleteResume(req.params.resumeId, req.user._id);

  return res.status(204).end();
});

// ── POST /api/v1/resumes/:resumeId/parse — Trigger parsing manually ──────────

const parseResume = asyncHandler(async (req, res) => {
  checkValidation(req);

  const resume = await resumeService.getResumeById(req.params.resumeId, req.user._id);

  if (resume.parsingStatus === 'Processing') {
    throw new AppError('Resume is currently being parsed.', 400, 'PARSING_IN_PROGRESS');
  }

  // Trigger parsing in the background asynchronously
  const resumeParsingService = require('../services/parsing/resumeParsingService');
  resumeParsingService.parseResume(resume._id).catch((err) => {
    logger.error(`[resumeController] Async parse trigger error for ${resume._id}: ${err.message}`);
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Resume parsing triggered successfully.',
    data: { resumeId: resume._id, parsingStatus: 'Pending' },
  });
});

// ── GET /api/v1/resumes/:resumeId/parsed-content — Retrieve parsed text/sections

const getParsedContent = asyncHandler(async (req, res) => {
  checkValidation(req);

  const resume = await resumeService.getResumeById(req.params.resumeId, req.user._id);

  return sendSuccess(res, {
    data: {
      resumeId: resume._id,
      fileName: resume.fileName,
      parsingStatus: resume.parsingStatus,
      parsingError: resume.parsingError,
      parsedAt: resume.parsedAt,
      parsedText: resume.parsedText,
      sections: resume.sections,
      wordCount: resume.wordCount,
      pageCount: resume.pageCount,
    },
  });
});

module.exports = {
  uploadResume,
  listResumes,
  getResume,
  deleteResume,
  parseResume,
  getParsedContent,
};
