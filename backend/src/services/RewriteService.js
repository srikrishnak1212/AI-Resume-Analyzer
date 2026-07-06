'use strict';

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const ResumeRewrite = require('../models/ResumeRewrite');
const Resume = require('../models/Resume');
const User = require('../models/User');

const promptBuilder = require('./ai/PromptBuilder');
const retryManager = require('./ai/RetryManager');
const geminiClient = require('./ai/GeminiClient');

const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const config = require('../config/env');

class RewriteService {
  /**
   * Helper to generate SHA-256 hash
   */
  _generateHash(text) {
    if (!text) return '';
    return crypto.createHash('sha256').update(text.trim()).digest('hex');
  }

  /**
   * Helper to get next version number
   */
  async _getNextVersionNumber(userId) {
    const latest = await Resume.findOne({ userId, isDeleted: false })
      .sort({ versionNumber: -1 })
      .select('versionNumber')
      .lean();

    return latest ? latest.versionNumber + 1 : 1;
  }

  /**
   * Helper to update specific resume sections and rebuild parsedText
   */
  _updateResumeSection(resume, sectionName, rewrittenText) {
    const sections = JSON.parse(JSON.stringify(resume.sections || {}));

    if (sectionName === 'Professional Summary') {
      sections.summary = rewrittenText;
    } else if (sectionName === 'Experience') {
      sections.experience = rewrittenText;
    } else if (sectionName === 'Projects') {
      sections.projects = rewrittenText;
    } else if (sectionName === 'Skills') {
      sections.skills = rewrittenText.split(/,|\n/).map((s) => s.trim()).filter(Boolean);
    } else if (sectionName === 'Education') {
      sections.education = rewrittenText;
    } else if (sectionName === 'Achievements') {
      sections.achievements = rewrittenText.split('\n').map((s) => s.trim().replace(/^-\s*/, '')).filter(Boolean);
    } else if (sectionName === 'Certifications') {
      sections.certifications = rewrittenText.split('\n').map((s) => s.trim().replace(/^-\s*/, '')).filter(Boolean);
    } else if (sectionName === 'Entire Resume') {
      resume.parsedText = rewrittenText;
      return sections;
    }

    // Rebuild parsedText
    let newParsed = '';
    if (sections.summary) newParsed += `SUMMARY\n${sections.summary}\n\n`;
    if (sections.experience) {
      newParsed += `EXPERIENCE\n${typeof sections.experience === 'string' ? sections.experience : JSON.stringify(sections.experience)}\n\n`;
    }
    if (sections.skills && sections.skills.length) newParsed += `SKILLS\n${sections.skills.join(', ')}\n\n`;
    if (sections.projects) {
      newParsed += `PROJECTS\n${typeof sections.projects === 'string' ? sections.projects : JSON.stringify(sections.projects)}\n\n`;
    }
    if (sections.education) {
      newParsed += `EDUCATION\n${typeof sections.education === 'string' ? sections.education : JSON.stringify(sections.education)}\n\n`;
    }

    resume.parsedText = newParsed.trim() || rewrittenText;
    return sections;
  }

  /**
   * Trigger rewrite of resume section
   */
  async triggerRewrite(userId, { resumeId, sectionName, rewriteMode, originalContent, improvements = [] }) {
    if (!originalContent || originalContent.trim().length < 10) {
      throw new AppError('Original content is too short to rewrite.', 400);
    }

    const resume = await Resume.findOne({ _id: resumeId, userId, isDeleted: false });
    if (!resume) {
      throw new AppError('Resume not found or access denied.', 404);
    }

    const aiModel = config.gemini.model;
    const promptVersion = 'v1';
    const analysisVersion = '1.0.0';

    // Calculate cache hash
    const inputKey = `${resumeId}_${sectionName}_${rewriteMode}_${promptVersion}_${aiModel}`;
    const cacheHash = this._generateHash(inputKey);

    // Check cache
    const cached = await ResumeRewrite.findOne({ cacheHash, userId, isDeleted: false });
    if (cached) {
      logger.info(`[RewriteService] Cache HIT for rewrite of section ${sectionName} using mode ${rewriteMode}`);
      return cached;
    }

    // Determine prompt mapping
    let promptName = 'resumeRewrite';
    if (sectionName === 'Professional Summary') {
      promptName = 'professionalSummaryRewrite';
    } else if (sectionName === 'Experience') {
      promptName = 'experienceRewrite';
    } else if (sectionName === 'Projects') {
      promptName = 'projectRewrite';
    } else if (sectionName === 'Entire Resume') {
      promptName = 'entireResumeRewrite';
    }

    const { systemPrompt, userPrompt } = promptBuilder.buildPrompt({
      promptName,
      version: promptVersion,
      variables: {
        rewriteMode,
        improvements: improvements.join(', ') || 'General improvements',
        originalContent,
      },
    });

    const rewrittenContent = await retryManager.executeRewriteWithRetry({
      provider: geminiClient,
      originalContent,
      promptOptions: {
        systemPrompt,
        userPrompt,
        aiModel,
        rewriteMode,
      },
    });

    const rewriteId = uuidv4();
    const rewrite = await ResumeRewrite.create({
      rewriteId,
      userId,
      resumeId,
      sectionName,
      rewriteMode,
      originalContent,
      rewrittenContent,
      improvements,
      status: 'Pending',
      aiModel,
      promptVersion,
      analysisVersion,
      cacheHash,
    });

    logger.info(`[RewriteService] Saved rewrite record: ${rewrite._id} (ID: ${rewriteId})`);
    return rewrite;
  }

  /**
   * Accept rewrite: saves a new resume version with updated section
   */
  async acceptRewrite(userId, rewriteId) {
    const rewrite = await ResumeRewrite.findOne({ rewriteId, userId, isDeleted: false });
    if (!rewrite) {
      throw new AppError('Rewrite record not found.', 404);
    }
    if (rewrite.status !== 'Pending') {
      throw new AppError(`Rewrite has already been ${rewrite.status.toLowerCase()}.`, 400);
    }

    const originalResume = await Resume.findOne({ _id: rewrite.resumeId, userId, isDeleted: false });
    if (!originalResume) {
      throw new AppError('Original resume not found.', 404);
    }

    // Clone resume & increment version
    const versionNumber = await this._getNextVersionNumber(userId);
    const newResume = new Resume({
      userId,
      fileName: `Rewritten - ${originalResume.fileName}`,
      fileSize: originalResume.fileSize,
      fileType: originalResume.fileType,
      storageUrl: originalResume.storageUrl,
      storageKey: `rewrites/${uuidv4()}_${originalResume.fileName}`,
      versionNumber,
      versionLabel: `Rewritten section: ${rewrite.sectionName}`,
      parsingStatus: 'Completed',
      analysisStatus: 'pending',
    });

    // Update section and assemblies
    newResume.sections = this._updateResumeSection(newResume, rewrite.sectionName, rewrite.rewrittenContent);

    // Preserve other sections
    if (rewrite.sectionName !== 'Entire Resume') {
      Object.keys(originalResume.sections.toObject()).forEach((key) => {
        if (key !== 'summary' && key !== 'experience' && key !== 'projects' && key !== 'skills' && key !== 'education' && key !== 'achievements' && key !== 'certifications' && key !== 'contactInfo') {
          return;
        }
        
        // Re-align unedited keys
        const sectionMap = {
          'Professional Summary': 'summary',
          'Experience': 'experience',
          'Projects': 'projects',
          'Skills': 'skills',
          'Education': 'education',
          'Achievements': 'achievements',
          'Certifications': 'certifications'
        };
        const currentTargetKey = sectionMap[rewrite.sectionName];
        if (key !== currentTargetKey) {
          newResume.sections[key] = originalResume.sections[key];
        }
      });
      newResume.sections.contactInfo = originalResume.sections.contactInfo;
    }

    await newResume.save();

    // Increment user resumeCount
    await User.findByIdAndUpdate(userId, { $inc: { resumeCount: 1 } });

    // Update rewrite details
    rewrite.status = 'Accepted';
    rewrite.newResumeId = newResume._id;
    await rewrite.save();

    logger.info(`[RewriteService] Rewrite accepted. Created resume version v${versionNumber} (ID: ${newResume._id})`);
    return newResume;
  }

  /**
   * Reject rewrite
   */
  async rejectRewrite(userId, rewriteId) {
    const rewrite = await ResumeRewrite.findOne({ rewriteId, userId, isDeleted: false });
    if (!rewrite) {
      throw new AppError('Rewrite record not found.', 404);
    }
    if (rewrite.status !== 'Pending') {
      throw new AppError(`Rewrite has already been ${rewrite.status.toLowerCase()}.`, 400);
    }

    rewrite.status = 'Rejected';
    await rewrite.save();
    logger.info(`[RewriteService] Rewrite rejected: ${rewriteId}`);
  }

  /**
   * Get single rewrite
   */
  async getRewriteById(userId, rewriteId) {
    const rewrite = await ResumeRewrite.findOne({ rewriteId, userId, isDeleted: false })
      .populate('resumeId')
      .populate('newResumeId')
      .lean();

    if (!rewrite) {
      throw new AppError('Rewrite record not found or access denied.', 404);
    }

    return rewrite;
  }

  /**
   * List paginated rewrites
   */
  async listRewrites(userId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const query = { userId, isDeleted: false };

    const [rewrites, total] = await Promise.all([
      ResumeRewrite.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('resumeId', 'fileName versionNumber')
        .populate('newResumeId', 'fileName versionNumber')
        .lean(),
      ResumeRewrite.countDocuments(query),
    ]);

    return { rewrites, total };
  }

  /**
   * Soft-delete rewrite
   */
  async deleteRewrite(userId, rewriteId) {
    const rewrite = await ResumeRewrite.findOne({ rewriteId, userId, isDeleted: false });
    if (!rewrite) {
      throw new AppError('Rewrite record not found.', 404);
    }

    rewrite.isDeleted = true;
    await rewrite.save();
    logger.info(`[RewriteService] Rewrite soft-deleted: ${rewriteId}`);
  }
}

module.exports = new RewriteService();
