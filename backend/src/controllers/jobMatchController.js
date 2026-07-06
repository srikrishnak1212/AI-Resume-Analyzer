'use strict';

const { validationResult } = require('express-validator');
const jobMatchingService = require('../services/JobMatchingService');
const { sendSuccess, buildPagination } = require('../utils/responseFormatter');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw new AppError('Validation failed.', 400, 'VALIDATION_ERROR', details);
  }
};

// ── POST /api/v1/job-description/text — Paste JD text ────────────────────────
const createTextJobDescription = asyncHandler(async (req, res) => {
  checkValidation(req);

  const { jobTitle, companyName, text } = req.body;
  const jobDescription = await jobMatchingService.createJobDescriptionFromText(req.user._id, {
    jobTitle,
    companyName,
    text,
  });

  return sendSuccess(res, {
    statusCode: 201,
    data: { jobDescription },
    message: 'Job description saved successfully.',
  });
});

// ── POST /api/v1/job-description/upload — Upload JD file ──────────────────────
const uploadFileJobDescription = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file provided. Please attach a PDF, DOCX, or TXT file.', 400, 'NO_FILE');
  }

  const { jobTitle, companyName } = req.body;
  const jobDescription = await jobMatchingService.createJobDescriptionFromFile(req.user._id, {
    multerFile: req.file,
    jobTitle,
    companyName,
  });

  return sendSuccess(res, {
    statusCode: 201,
    data: { jobDescription },
    message: 'Job description file uploaded and parsed successfully.',
  });
});

// ── POST /api/v1/job-match — Match resume against JD ──────────────────────────
const createMatch = asyncHandler(async (req, res) => {
  checkValidation(req);

  const { resumeId, jobDescriptionId } = req.body;
  const jobMatch = await jobMatchingService.getMatchOrCreate(req.user._id, {
    resumeId,
    jobDescriptionId,
  });

  return sendSuccess(res, {
    statusCode: 201,
    data: { jobMatch },
    message: 'Job match evaluation completed successfully.',
  });
});

// ── GET /api/v1/job-match/history — Paginated history ────────────────────────
const listMatches = asyncHandler(async (req, res) => {
  checkValidation(req);

  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const { matches, total } = await jobMatchingService.listMatches(req.user._id, {
    page: Number(page),
    limit: Number(limit),
  });

  return sendSuccess(res, {
    data: { matches },
    pagination: buildPagination({ page: Number(page), limit: Number(limit), total }),
  });
});

// ── GET /api/v1/job-match/:id — Get details ──────────────────────────────────
const getMatch = asyncHandler(async (req, res) => {
  checkValidation(req);

  const jobMatch = await jobMatchingService.getMatchById(req.params.id, req.user._id);

  return sendSuccess(res, { data: { jobMatch } });
});

// ── DELETE /api/v1/job-match/:id — Soft-delete ────────────────────────────────
const deleteMatch = asyncHandler(async (req, res) => {
  checkValidation(req);

  await jobMatchingService.deleteMatch(req.params.id, req.user._id);

  return res.status(204).end();
});

module.exports = {
  createTextJobDescription,
  uploadFileJobDescription,
  createMatch,
  listMatches,
  getMatch,
  deleteMatch,
};
