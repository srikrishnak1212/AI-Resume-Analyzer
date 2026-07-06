'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const JobDescription = require('../models/JobDescription');
const JobMatch = require('../models/JobMatch');
const Resume = require('../models/Resume');
const User = require('../models/User');

const storageService = require('./storageService');
const { parsePdf } = require('./parsing/pdfParser');
const { parseDocx } = require('./parsing/docxParser');

const promptBuilder = require('./ai/PromptBuilder');
const retryManager = require('./ai/RetryManager');
const geminiClient = require('./ai/GeminiClient');

const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const config = require('../config/env');

class JobMatchingService {
  /**
   * Helper to generate SHA-256 hash
   */
  _generateHash(text) {
    if (!text) return '';
    return crypto.createHash('sha256').update(text.trim()).digest('hex');
  }

  /**
   * Create JobDescription from raw text input
   */
  async createJobDescriptionFromText(userId, { jobTitle, companyName, text }) {
    if (!text || text.trim().length < 50) {
      throw new AppError('Job description text must be at least 50 characters long.', 400);
    }

    const jobDescriptionId = uuidv4();
    const rawText = text.trim();

    // 1. Build extraction prompts
    const { systemPrompt, userPrompt } = promptBuilder.buildPrompt({
      promptName: 'jobDescriptionExtraction',
      version: 'v1',
      variables: {
        jobDescriptionText: rawText,
      },
    });

    // 2. Invoke Gemini for details extraction
    const extracted = await retryManager.executeJobDescriptionExtractionWithRetry({
      provider: geminiClient,
      jobDescriptionText: rawText,
      promptOptions: {
        systemPrompt,
        userPrompt,
        aiModel: config.gemini.model,
      },
    });

    // 3. Save to database
    const jd = await JobDescription.create({
      jobDescriptionId,
      userId,
      jobTitle: jobTitle || extracted.jobTitle || 'Untitled Role',
      companyName: companyName || extracted.companyName || 'Unknown Company',
      rawText,
      parsedText: rawText,
      extractedDetails: extracted,
    });

    logger.info(`[JobMatchingService] Job description text saved: ${jd._id} (ID: ${jobDescriptionId})`);
    return jd;
  }

  /**
   * Create JobDescription from uploaded file
   */
  async createJobDescriptionFromFile(userId, { multerFile, jobTitle, companyName }) {
    const { path: diskPath, originalname, mimetype, size } = multerFile;

    // 1. Save file to storage
    const { storageKey, storageUrl } = await storageService.save(diskPath, userId);

    try {
      const filePath = path.resolve(process.cwd(), storageKey);
      if (!fs.existsSync(filePath)) {
        throw new Error('Backing storage file does not exist on disk.');
      }

      const buffer = fs.readFileSync(filePath);
      let parsedText = '';

      const ext = path.extname(originalname).toLowerCase();

      // 2. Format specific text extraction
      if (mimetype === 'application/pdf') {
        const parsed = await parsePdf(buffer, originalname);
        parsedText = parsed.text;
      } else if (
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const parsed = await parseDocx(buffer, originalname);
        parsedText = parsed.text;
      } else if (ext === '.txt' || mimetype === 'text/plain') {
        parsedText = buffer.toString('utf8');
      } else {
        throw new Error(`Unsupported file type: ${mimetype}`);
      }

      if (!parsedText || parsedText.trim().length < 50) {
        throw new Error('Empty or unreadable text extracted. Must be at least 50 characters.');
      }

      const jobDescriptionId = uuidv4();
      const rawText = parsedText.trim();

      // 3. Build extraction prompts
      const { systemPrompt, userPrompt } = promptBuilder.buildPrompt({
        promptName: 'jobDescriptionExtraction',
        version: 'v1',
        variables: {
          jobDescriptionText: rawText,
        },
      });

      // 4. Invoke Gemini for details extraction
      const extracted = await retryManager.executeJobDescriptionExtractionWithRetry({
        provider: geminiClient,
        jobDescriptionText: rawText,
        promptOptions: {
          systemPrompt,
          userPrompt,
          aiModel: config.gemini.model,
        },
      });

      // 5. Save to database
      const jd = await JobDescription.create({
        jobDescriptionId,
        userId,
        jobTitle: jobTitle || extracted.jobTitle || originalname.replace(ext, ''),
        companyName: companyName || extracted.companyName || 'Unknown Company',
        rawText,
        parsedText: rawText,
        fileName: originalname,
        fileSize: size,
        fileType: mimetype,
        storageKey,
        extractedDetails: extracted,
      });

      logger.info(`[JobMatchingService] Job description file parsed and saved: ${jd._id} (ID: ${jobDescriptionId})`);
      return jd;
    } catch (err) {
      // Cleanup storage key if failed
      await storageService.delete(storageKey).catch(() => {});
      logger.error(`[JobMatchingService] File upload parse failed: ${err.message}`);
      throw new AppError(err.message, 400);
    }
  }

  /**
   * Run job matching evaluation or retrieve from cache
   */
  async getMatchOrCreate(userId, { resumeId, jobDescriptionId }) {
    // 1. Resolve Resume
    const resume = await Resume.findOne({ _id: resumeId, userId, isDeleted: false });
    if (!resume) {
      throw new AppError('Resume not found or access denied.', 404);
    }
    if (resume.parsingStatus !== 'Completed') {
      throw new AppError('Resume must be successfully parsed before matching.', 400);
    }

    // 2. Resolve JobDescription
    const jd = await JobDescription.findOne({ _id: jobDescriptionId, userId, isDeleted: false });
    if (!jd) {
      throw new AppError('Job description not found or access denied.', 404);
    }

    // 3. Generate SHA-256 hashes
    const resumeHash = this._generateHash(resume.parsedText);
    const jobDescriptionHash = this._generateHash(jd.rawText);

    const aiModel = config.gemini.model;
    const promptVersion = 'v1';
    const analysisVersion = '1.0.0';

    // 4. Check cache
    const cachedMatch = await JobMatch.findOne({
      resumeHash,
      jobDescriptionHash,
      promptVersion,
      aiModel,
      analysisVersion,
      isDeleted: false,
    });

    if (cachedMatch) {
      logger.info(`[JobMatchingService] Cache HIT for match between resume ${resumeId} and JD ${jobDescriptionId}`);
      
      // If the cached match references different resumeId or jobDescriptionId documents (but same hash),
      // we can return it directly or clone it for this user's specific query.
      // Here, returning the cached document is correct and highly performant.
      return cachedMatch;
    }

    logger.info(`[JobMatchingService] Cache MISS. Invoking Gemini Job Match comparison...`);

    const jobDescriptionDetails = JSON.stringify(jd.extractedDetails, null, 2);

    // 5. Build prompt templates
    const { systemPrompt, userPrompt } = promptBuilder.buildPrompt({
      promptName: 'jobMatching',
      version: 'v1',
      variables: {
        resumeText: resume.parsedText,
        jobDescriptionDetails,
      },
    });

    // 6. Invoke Gemini for comparison
    const matchResult = await retryManager.executeJobMatchWithRetry({
      provider: geminiClient,
      resumeText: resume.parsedText,
      jobDescriptionText: jobDescriptionDetails,
      promptOptions: {
        systemPrompt,
        userPrompt,
        aiModel,
        resumeId: resume._id.toString(),
        jobDescriptionId: jd._id.toString(),
      },
    });

    // 7. Persist comparison to database
    const jobMatchId = uuidv4();
    const match = await JobMatch.create({
      jobMatchId,
      resumeId: resume._id,
      jobDescriptionId: jd._id,
      userId,
      overallScore: matchResult.overallMatchScore,
      sectionScores: {
        technicalSkillsScore: matchResult.technicalSkillsScore,
        softSkillsScore: matchResult.softSkillsScore,
        experienceScore: matchResult.experienceScore,
        educationScore: matchResult.educationScore,
        projectsScore: matchResult.projectsScore,
        keywordScore: matchResult.keywordScore,
        atsCompatibilityScore: matchResult.overallMatchScore, // fallback or map
      },
      matchedSkills: matchResult.matchedSkills,
      missingSkills: matchResult.missingSkills,
      matchedKeywords: matchResult.matchedKeywords,
      missingKeywords: matchResult.missingKeywords,
      strengths: matchResult.strengths,
      weaknesses: matchResult.weaknesses,
      recommendations: matchResult.recommendations,
      resumeImprovements: matchResult.resumeImprovements,
      priorityActions: matchResult.priorityActions || matchResult.resumeImprovements.slice(0, 2),
      summary: matchResult.summary,
      confidenceScore: matchResult.confidenceScore,
      aiModel,
      promptVersion,
      analysisVersion,
      resumeHash,
      jobDescriptionHash,
    });

    logger.info(`[JobMatchingService] JobMatch completed and saved: ${match._id} (ID: ${jobMatchId})`);
    return match;
  }

  /**
   * Retrieve JobMatch by ID
   */
  async getMatchById(id, userId) {
    const match = await JobMatch.findOne({ jobMatchId: id, userId, isDeleted: false })
      .populate('resumeId')
      .populate('jobDescriptionId')
      .lean();

    if (!match) {
      throw new AppError('Job match not found or access denied.', 404);
    }

    return match;
  }

  /**
   * List paginated history of Job Matches for a user
   */
  async listMatches(userId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const query = { userId, isDeleted: false };

    const [matches, total] = await Promise.all([
      JobMatch.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('resumeId', 'fileName versionNumber')
        .populate('jobDescriptionId', 'jobTitle companyName')
        .lean(),
      JobMatch.countDocuments(query),
    ]);

    return { matches, total };
  }

  /**
   * Soft-delete a JobMatch record
   */
  async deleteMatch(id, userId) {
    const match = await JobMatch.findOne({ jobMatchId: id, userId, isDeleted: false });
    if (!match) {
      throw new AppError('Job match not found or access denied.', 404);
    }

    match.isDeleted = true;
    await match.save();

    logger.info(`[JobMatchingService] JobMatch soft-deleted: ${id}`);
  }
}

module.exports = new JobMatchingService();
