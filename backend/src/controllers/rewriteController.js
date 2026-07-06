'use strict';

const { validationResult } = require('express-validator');
const rewriteService = require('../services/RewriteService');
const { sendSuccess, buildPagination } = require('../utils/responseFormatter');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw new AppError('Validation failed.', 400, 'VALIDATION_ERROR', details);
  }
};

const triggerRewrite = asyncHandler(async (req, res) => {
  checkValidation(req);

  const { resumeId, sectionName, rewriteMode, originalContent, improvements } = req.body;
  const rewrite = await rewriteService.triggerRewrite(req.user._id, {
    resumeId,
    sectionName,
    rewriteMode,
    originalContent,
    improvements,
  });

  return sendSuccess(res, {
    statusCode: 201,
    data: { rewrite },
    message: 'Rewrite generated successfully.',
  });
});

const acceptRewrite = asyncHandler(async (req, res) => {
  checkValidation(req);

  const { rewriteId } = req.body;
  const newResume = await rewriteService.acceptRewrite(req.user._id, rewriteId);

  return sendSuccess(res, {
    statusCode: 200,
    data: { resume: newResume.toPublicJSON() },
    message: 'Rewrite accepted and saved as a new resume version.',
  });
});

const rejectRewrite = asyncHandler(async (req, res) => {
  checkValidation(req);

  const { rewriteId } = req.body;
  await rewriteService.rejectRewrite(req.user._id, rewriteId);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Rewrite rejected.',
  });
});

const listRewrites = asyncHandler(async (req, res) => {
  checkValidation(req);

  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const { rewrites, total } = await rewriteService.listRewrites(req.user._id, {
    page: Number(page),
    limit: Number(limit),
  });

  return sendSuccess(res, {
    data: { rewrites },
    pagination: buildPagination({ page: Number(page), limit: Number(limit), total }),
  });
});

const getRewrite = asyncHandler(async (req, res) => {
  checkValidation(req);

  const rewrite = await rewriteService.getRewriteById(req.user._id, req.params.id);
  return sendSuccess(res, { data: { rewrite } });
});

const deleteRewrite = asyncHandler(async (req, res) => {
  checkValidation(req);

  await rewriteService.deleteRewrite(req.user._id, req.params.id);
  return res.status(204).end();
});

module.exports = {
  triggerRewrite,
  acceptRewrite,
  rejectRewrite,
  listRewrites,
  getRewrite,
  deleteRewrite,
};
