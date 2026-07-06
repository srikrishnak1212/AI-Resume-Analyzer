'use strict';

const { validationResult } = require('express-validator');
const coverLetterService = require('../services/CoverLetterService');
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

const generateCoverLetter = asyncHandler(async (req, res) => {
  checkValidation(req);

  const { resumeId, jobDescriptionId, companyName, jobTitle, hiringManager, tone, length } = req.body;
  const coverLetter = await coverLetterService.generateCoverLetter(req.user._id, {
    resumeId,
    jobDescriptionId,
    companyName,
    jobTitle,
    hiringManager,
    tone,
    length,
  });

  return sendSuccess(res, {
    statusCode: 201,
    data: { coverLetter },
    message: 'Cover letter generated successfully.',
  });
});

const listCoverLetters = asyncHandler(async (req, res) => {
  checkValidation(req);

  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const { letters, total } = await coverLetterService.listCoverLetters(req.user._id, {
    page: Number(page),
    limit: Number(limit),
  });

  return sendSuccess(res, {
    data: { coverLetters: letters },
    pagination: buildPagination({ page: Number(page), limit: Number(limit), total }),
  });
});

const getCoverLetter = asyncHandler(async (req, res) => {
  checkValidation(req);

  const coverLetter = await coverLetterService.getCoverLetterById(req.params.id, req.user._id);
  return sendSuccess(res, { data: { coverLetter } });
});

const deleteCoverLetter = asyncHandler(async (req, res) => {
  checkValidation(req);

  await coverLetterService.deleteCoverLetter(req.params.id, req.user._id);
  return res.status(204).end();
});

const downloadPDF = asyncHandler(async (req, res) => {
  checkValidation(req);

  const coverLetter = await coverLetterService.getCoverLetterById(req.params.id, req.user._id);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="CoverLetter_${coverLetter.jobTitle.replace(/\s+/g, '_')}.pdf"`);

  const stream = coverLetterService.generatePDFStream(coverLetter);
  stream.pipe(res);
});

const downloadDOCX = asyncHandler(async (req, res) => {
  checkValidation(req);

  const coverLetter = await coverLetterService.getCoverLetterById(req.params.id, req.user._id);
  const buffer = await coverLetterService.generateDOCXBuffer(coverLetter);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="CoverLetter_${coverLetter.jobTitle.replace(/\s+/g, '_')}.docx"`);

  return res.send(buffer);
});

module.exports = {
  generateCoverLetter,
  listCoverLetters,
  getCoverLetter,
  deleteCoverLetter,
  downloadPDF,
  downloadDOCX,
};
