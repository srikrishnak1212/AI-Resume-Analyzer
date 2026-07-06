'use strict';

/**
 * Resume Service — business logic for resume upload, retrieval, and deletion.
 * All database operations and parsing logic live here; the controller stays thin.
 *
 * Reference: Database.md §3.2, API.md §3, Implementation-Guide.md Phase 3
 * Rule: Services handle API calls, async/await, never duplicate code (PROJECT_RULES.md)
 */

const fs = require('fs');
const Resume = require('../models/Resume');
const User = require('../models/User');
const storageService = require('./storageService');
const resumeParsingService = require('./parsing/resumeParsingService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determine the next version number for a user.
 * Finds the highest existing versionNumber and increments by 1.
 *
 * @param {string} userId
 * @returns {Promise<number>}
 */
const getNextVersionNumber = async (userId) => {
  const latest = await Resume.findOne({ userId, isDeleted: false })
    .sort({ versionNumber: -1 })
    .select('versionNumber')
    .lean();

  return latest ? latest.versionNumber + 1 : 1;
};

// ─── Upload Resume ────────────────────────────────────────────────────────────

/**
 * Upload, parse, and persist a new resume for a user.
 *
 * @param {object} opts
 * @param {string}  opts.userId
 * @param {object}  opts.multerFile — the file object from multer (req.file)
 * @param {string}  [opts.versionLabel]
 * @returns {Promise<Resume>}
 */
const uploadResume = async ({ userId, multerFile, versionLabel }) => {
  const { path: diskPath, originalname, mimetype, size } = multerFile;

  // ── 1. Save to storage (local in MVP) ────────────────────────────────────────
  const { storageKey, storageUrl } = await storageService.save(diskPath, userId);

  // ── 2. Determine version number ───────────────────────────────────────────────
  const versionNumber = await getNextVersionNumber(userId);

  // ── 3. Create Resume document in Pending state ───────────────────────────────
  const resume = await Resume.create({
    userId,
    fileName: originalname,
    fileSize: size,
    fileType: mimetype,
    storageUrl,
    storageKey,
    versionNumber,
    versionLabel: versionLabel || null,
    parsingStatus: 'Pending',
    analysisStatus: 'pending',
  });

  // ── 4. Increment user's resumeCount ───────────────────────────────────────────
  await User.findByIdAndUpdate(userId, { $inc: { resumeCount: 1 } });

  // ── 5. Trigger parsing asynchronously in the background ─────────────────────
  resumeParsingService.parseResume(resume._id).catch((err) => {
    logger.error(`[resumeService] Background parsing error for Resume ${resume._id}: ${err.message}`);
  });

  logger.info(`[resumeService] Resume record created and background parsing triggered: ${resume._id} (v${versionNumber}) for user ${userId}`);

  return resume;
};

// ─── List Resumes ─────────────────────────────────────────────────────────────

/**
 * Retrieve a paginated list of resumes for a user (newest first).
 *
 * @param {object} opts
 * @param {string} opts.userId
 * @param {number} [opts.page=1]
 * @param {number} [opts.limit=10]
 * @returns {Promise<{ resumes: Resume[], total: number }>}
 */
const listResumes = async ({ userId, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const query = { userId, isDeleted: false };

  const [resumes, total] = await Promise.all([
    Resume.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-parsedText -storageKey')  // keep response lean
      .lean(),
    Resume.countDocuments(query),
  ]);

  return { resumes, total };
};

// ─── Get Resume Detail ────────────────────────────────────────────────────────

/**
 * Fetch a single resume by ID, verifying ownership.
 *
 * @param {string} resumeId
 * @param {string} userId
 * @returns {Promise<Resume>}
 */
const getResumeById = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId, isDeleted: false })
    .select('-storageKey')
    .lean();

  if (!resume) {
    throw new AppError('Resume not found.', 404, 'NOT_FOUND');
  }

  return resume;
};

// ─── Delete Resume ────────────────────────────────────────────────────────────

/**
 * Soft-delete a resume and remove the backing file.
 *
 * @param {string} resumeId
 * @param {string} userId
 * @returns {Promise<void>}
 */
const deleteResume = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId, isDeleted: false });

  if (!resume) {
    throw new AppError('Resume not found.', 404, 'NOT_FOUND');
  }

  // Soft-delete the DB record first
  resume.isDeleted = true;
  resume.deletedAt = new Date();
  await resume.save();

  // Decrement user's resumeCount
  await User.findByIdAndUpdate(userId, { $inc: { resumeCount: -1 } });

  // Attempt to remove the physical file (non-fatal if missing)
  await storageService.delete(resume.storageKey);

  logger.info(`[resumeService] Resume soft-deleted: ${resumeId} for user ${userId}`);
};

module.exports = {
  uploadResume,
  listResumes,
  getResumeById,
  deleteResume,
};
