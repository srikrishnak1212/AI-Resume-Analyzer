'use strict';

/**
 * Analysis Service — Business logic for AI Resume Analysis.
 * Orchestrates prompt compilation, cached lookups by SHA-256 hash, Gemini client execution,
 * response validation, corrective retries, and asynchronous background tasks.
 *
 * Reference: Architecture.md §6.1, Database.md §3.3, AI-Prompts.md §1.8, §1.9, §18, §19
 */

const uuid = require('uuid');
const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const promptBuilder = require('./ai/PromptBuilder');
const geminiClient = require('./ai/GeminiClient');
const retryManager = require('./ai/RetryManager');
const aiCacheManager = require('./ai/AiCacheManager');
const aiLogger = require('./ai/AiLogger');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const config = require('../config/env');

// ─── Trigger AI Analysis ──────────────────────────────────────────────────────

/**
 * Initiates the AI Resume Analysis.
 * Checks for duplicate requests, checks parsing status, evaluates content hash caching,
 * and kicks off a background task if there is a cache miss.
 *
 * @param {string} resumeId
 * @param {string} userId
 * @returns {Promise<Analysis>} Analysis document (can be pending, processing, or completed)
 */
const startAnalysis = async (resumeId, userId) => {
  // 1. Fetch resume and validate ownership
  const resume = await Resume.findOne({ _id: resumeId, userId, isDeleted: false });
  if (!resume) {
    throw new AppError('Resume not found.', 404, 'NOT_FOUND');
  }

  // 2. Verify parsing status
  if (resume.parsingStatus !== 'Completed') {
    throw new AppError(
      `Resume must be parsed successfully before analysis. Current status: ${resume.parsingStatus}`,
      400,
      'RESUME_NOT_PARSED'
    );
  }

  // 3. Prevent duplicate active analysis requests (pending/processing)
  const activeJob = await Analysis.findOne({
    resumeId,
    userId,
    status: { $in: ['pending', 'processing'] },
    isDeleted: false,
  });

  if (activeJob) {
    logger.info(`[analysisService] Active analysis job already exists for Resume ${resumeId}. Returning existing job.`);
    return activeJob;
  }

  // 4. Compute parsed text hash
  const resumeText = resume.parsedText || '';
  const resumeHash = aiCacheManager.generateHash(resumeText);
  const promptVersion = '1.0.0';
  const analysisVersion = '1.0.0';
  const aiModel = config.gemini.model;

  // 5. Intelligent Caching Lookup
  const cachedAnalysis = await aiCacheManager.findCachedAnalysis({
    resumeHash,
    promptVersion,
    analysisVersion,
    aiModel,
  });

  if (cachedAnalysis) {
    // Increment hits on the original cached document
    await aiCacheManager.incrementCacheHits(cachedAnalysis._id);

    // Create a new record linked to the current user and resume to preserve isolation
    const newAnalysis = await Analysis.create({
      resumeId,
      userId,
      resumeHash,
      promptVersion,
      analysisVersion,
      aiProvider: 'google',
      aiModel,
      atsScore: cachedAnalysis.atsScore,
      grammarScore: cachedAnalysis.grammarScore,
      formattingScore: cachedAnalysis.formattingScore,
      skillsScore: cachedAnalysis.skillsScore,
      experienceScore: cachedAnalysis.experienceScore,
      educationScore: cachedAnalysis.educationScore,
      projectsScore: cachedAnalysis.projectsScore,
      summaryScore: cachedAnalysis.summaryScore,
      overallScore: cachedAnalysis.overallScore,
      strengths: cachedAnalysis.strengths,
      weaknesses: cachedAnalysis.weaknesses,
      suggestions: cachedAnalysis.suggestions,
      detectedSkills: cachedAnalysis.detectedSkills,
      missingSkills: cachedAnalysis.missingSkills,
      recommendedKeywords: cachedAnalysis.recommendedKeywords,
      professionalSummary: cachedAnalysis.professionalSummary,
      analysisSummary: cachedAnalysis.analysisSummary,
      analysisDuration: 0,
      cached: true,
      cacheHitCount: 0,
      status: 'completed',
    });

    // Update resume status to completed
    resume.analysisStatus = 'completed';
    await resume.save();

    // Log the cached event
    await aiLogger.logAiRequest({
      requestId: uuid.v4(),
      resumeId,
      userId,
      provider: 'google',
      model: aiModel,
      promptVersion,
      analysisVersion,
      responseTime: 0,
      cached: true,
      status: 'success',
    });

    logger.info(`[analysisService] Served cached analysis successfully for Resume ${resumeId}`);
    return newAnalysis;
  }

  // 6. Cache Miss — create a pending job
  const pendingAnalysis = await Analysis.create({
    resumeId,
    userId,
    resumeHash,
    promptVersion,
    analysisVersion,
    aiModel,
    atsScore: 0,
    grammarScore: 0,
    formattingScore: 0,
    skillsScore: 0,
    experienceScore: 0,
    educationScore: 0,
    projectsScore: 0,
    summaryScore: 0,
    overallScore: 0,
    analysisDuration: 0,
    status: 'pending',
  });

  // Update resume status to processing
  resume.analysisStatus = 'processing';
  await resume.save();

  // 7. Fire and forget background worker (non-blocking)
  runBackgroundAnalysis(pendingAnalysis._id, resumeText, resume.sections, userId, resumeId).catch((err) => {
    logger.error(`[analysisService] Fatal unhandled background analysis error: ${err.message}`);
  });

  logger.info(`[analysisService] Analysis job ${pendingAnalysis._id} queued in background for Resume ${resumeId}`);
  return pendingAnalysis;
};

// ─── Background Worker ────────────────────────────────────────────────────────

/**
 * Runs the Gemini call, validation pipelines, retries, and stores final results.
 *
 * @param {string} analysisId
 * @param {string} resumeText
 * @param {object} parsedSections
 * @param {string} userId
 * @param {string} resumeId
 */
const runBackgroundAnalysis = async (analysisId, resumeText, parsedSections, userId, resumeId) => {
  const startTime = Date.now();
  const requestId = uuid.v4();
  const promptVersion = '1.0.0';
  const analysisVersion = '1.0.0';
  const aiModel = config.gemini.model;

  // Retrieve job
  const analysisJob = await Analysis.findById(analysisId);
  if (!analysisJob) return;

  try {
    // Update status to processing
    analysisJob.status = 'processing';
    await analysisJob.save();

    // 1. Build dynamic prompts
    const targetRole = parsedSections?.contactInfo?.targetRole || 'Software Engineer';
    const { systemPrompt, userPrompt } = promptBuilder.buildPrompt({
      promptName: 'resumeAnalysis',
      version: 'v1',
      variables: {
        targetRole,
        resumeText,
        parsedSectionsJson: parsedSections,
      },
    });

    // 2. Invoke Gemini via RetryManager (exponential backoff & corrective self-correction)
    const result = await retryManager.executeWithRetry({
      provider: geminiClient,
      resumeText,
      parsedSections,
      promptOptions: {
        systemPrompt,
        userPrompt,
        aiModel,
      },
    });

    const duration = Date.now() - startTime;

    // 3. Map responses to fields
    analysisJob.atsScore = result.atsScore;
    analysisJob.grammarScore = result.grammarScore;
    analysisJob.formattingScore = result.formattingScore;
    analysisJob.skillsScore = result.skillsScore;
    analysisJob.experienceScore = result.experienceScore;
    analysisJob.educationScore = result.educationScore;
    analysisJob.projectsScore = result.projectsScore;
    analysisJob.summaryScore = result.summaryScore;
    analysisJob.overallScore = result.overallScore;
    analysisJob.strengths = result.strengths;
    analysisJob.weaknesses = result.weaknesses;
    analysisJob.suggestions = result.quickWins || result.suggestions;
    analysisJob.detectedSkills = result.skillsAnalysis?.detectedSkills || [];
    analysisJob.missingSkills = result.skillsAnalysis?.missingSkills || [];
    analysisJob.recommendedKeywords = result.atsAnalysis?.keywordsMissing || [];
    analysisJob.professionalSummary = result.scoreSummary;
    analysisJob.analysisSummary = result.scoreSummary;
    analysisJob.analysisDuration = duration;
    analysisJob.analysisTimestamp = new Date();
    analysisJob.status = 'completed';
    await analysisJob.save();

    // Update resume status
    await Resume.findByIdAndUpdate(resumeId, { analysisStatus: 'completed' });

    // 4. Audit Log
    await aiLogger.logAiRequest({
      requestId,
      resumeId,
      userId,
      provider: 'google',
      model: aiModel,
      promptVersion,
      analysisVersion,
      responseTime: duration,
      cached: false,
      status: 'success',
    });

    logger.info(`[analysisService] Background analysis completed successfully for Resume ${resumeId}`);
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.error(`[analysisService] Background analysis failed for Resume ${resumeId}: ${err.message}`);

    // Update analysis job to failed
    analysisJob.status = 'failed';
    analysisJob.errorMessage = err.message;
    await analysisJob.save();

    // Update resume status to failed
    await Resume.findByIdAndUpdate(resumeId, { analysisStatus: 'failed' });

    // Log the audit failure
    await aiLogger.logAiRequest({
      requestId,
      resumeId,
      userId,
      provider: 'google',
      model: aiModel,
      promptVersion,
      analysisVersion,
      responseTime: duration,
      cached: false,
      status: 'failure',
      errorMessage: err.message,
    });
  }
};

// ─── Get Analysis Detail ──────────────────────────────────────────────────────

/**
 * Fetch the latest analysis details for a resume version.
 *
 * @param {string} resumeId
 * @param {string} userId
 * @returns {Promise<Analysis>}
 */
const getAnalysisByResumeId = async (resumeId, userId) => {
  const analysis = await Analysis.findOne({ resumeId, userId, isDeleted: false })
    .sort({ createdAt: -1 });

  if (!analysis) {
    throw new AppError('No analysis found for this resume.', 404, 'NOT_FOUND');
  }

  return analysis;
};

// ─── List History ─────────────────────────────────────────────────────────────

/**
 * Fetch a paginated list of user analysis runs.
 *
 * @param {object} opts
 * @param {string} opts.userId
 * @param {number} [opts.page=1]
 * @param {number} [opts.limit=10]
 * @returns {Promise<{ analyses: Analysis[], total: number }>}
 */
const getUserAnalysisHistory = async ({ userId, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const query = { userId, isDeleted: false };

  const [analyses, total] = await Promise.all([
    Analysis.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('resumeId', 'fileName versionNumber') // link resume details
      .lean(),
    Analysis.countDocuments(query),
  ]);

  // Map population or map output to fit public structure cleanly
  const formattedAnalyses = analyses.map((a) => {
    const publicData = { ...a, analysisId: a._id.toString() };
    delete publicData._id;
    return publicData;
  });

  return { analyses: formattedAnalyses, total };
};

// ─── Delete Analysis ──────────────────────────────────────────────────────────

/**
 * Soft deletes an analysis record.
 *
 * @param {string} analysisId
 * @param {string} userId
 * @returns {Promise<void>}
 */
const deleteAnalysis = async (analysisId, userId) => {
  const analysis = await Analysis.findOne({ _id: analysisId, userId, isDeleted: false });
  if (!analysis) {
    throw new AppError('Analysis not found.', 404, 'NOT_FOUND');
  }

  analysis.isDeleted = true;
  analysis.deletedAt = new Date();
  await analysis.save();

  logger.info(`[analysisService] Analysis soft-deleted: ${analysisId} for user ${userId}`);
};

module.exports = {
  startAnalysis,
  getAnalysisByResumeId,
  getUserAnalysisHistory,
  deleteAnalysis,
};
