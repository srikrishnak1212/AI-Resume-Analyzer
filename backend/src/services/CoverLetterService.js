'use strict';

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx');

const CoverLetter = require('../models/CoverLetter');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');

const promptBuilder = require('./ai/PromptBuilder');
const retryManager = require('./ai/RetryManager');
const geminiClient = require('./ai/GeminiClient');

const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const config = require('../config/env');

class CoverLetterService {
  /**
   * Helper to generate SHA-256 hash
   */
  _generateHash(text) {
    if (!text) return '';
    return crypto.createHash('sha256').update(text.trim()).digest('hex');
  }

  /**
   * Generate cover letter using resume + JD + company metadata
   */
  async generateCoverLetter(userId, { resumeId, jobDescriptionId, companyName, jobTitle, hiringManager = '', tone, length }) {
    if (!companyName || !jobTitle) {
      throw new AppError('Company name and job title are required.', 400);
    }

    const resume = await Resume.findOne({ _id: resumeId, userId, isDeleted: false });
    if (!resume) {
      throw new AppError('Resume not found or access denied.', 404);
    }

    let jdText = 'Not provided.';
    if (jobDescriptionId) {
      const jd = await JobDescription.findOne({ _id: jobDescriptionId, userId, isDeleted: false });
      if (jd) {
        jdText = jd.rawText;
      }
    }

    const aiModel = config.gemini.model;
    const promptVersion = 'v1';
    const analysisVersion = '1.0.0';

    // Calculate cache key
    const inputKey = `${resumeId}_${jobDescriptionId || 'none'}_${companyName}_${jobTitle}_${tone}_${length}_${promptVersion}_${aiModel}`;
    const cacheHash = this._generateHash(inputKey);

    // Check cache
    const cached = await CoverLetter.findOne({ cacheHash, userId, isDeleted: false });
    if (cached) {
      logger.info(`[CoverLetterService] Cache HIT for cover letter: ${jobTitle} at ${companyName}`);
      return cached;
    }

    // Build prompt templates
    const { systemPrompt, userPrompt } = promptBuilder.buildPrompt({
      promptName: 'coverLetterGeneration',
      version: promptVersion,
      variables: {
        jobTitle,
        companyName,
        hiringManager: hiringManager || 'Hiring Team',
        tone,
        length,
        resumeText: resume.parsedText,
        jobDescriptionText: jdText,
      },
    });

    const coverLetterText = await retryManager.executeCoverLetterWithRetry({
      provider: geminiClient,
      resumeText: resume.parsedText,
      jobDescriptionText: jdText,
      promptOptions: {
        systemPrompt,
        userPrompt,
        aiModel,
        jobTitle,
        companyName,
        tone,
        hiringManager,
      },
    });

    const coverLetterId = uuidv4();
    const coverLetter = await CoverLetter.create({
      coverLetterId,
      userId,
      resumeId,
      jobDescriptionId: jobDescriptionId || null,
      companyName,
      jobTitle,
      hiringManager: hiringManager || null,
      tone,
      length,
      coverLetterText,
      aiModel,
      promptVersion,
      analysisVersion,
      cacheHash,
    });

    logger.info(`[CoverLetterService] Cover letter generated and saved: ${coverLetter._id} (ID: ${coverLetterId})`);
    return coverLetter;
  }

  /**
   * Get single cover letter
   */
  async getCoverLetterById(id, userId) {
    const coverLetter = await CoverLetter.findOne({ coverLetterId: id, userId, isDeleted: false })
      .populate('resumeId', 'fileName versionNumber')
      .populate('jobDescriptionId', 'jobTitle companyName')
      .lean();

    if (!coverLetter) {
      throw new AppError('Cover letter not found or access denied.', 404);
    }

    return coverLetter;
  }

  /**
   * List paginated cover letters
   */
  async listCoverLetters(userId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const query = { userId, isDeleted: false };

    const [letters, total] = await Promise.all([
      CoverLetter.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('resumeId', 'fileName versionNumber')
        .lean(),
      CoverLetter.countDocuments(query),
    ]);

    return { letters, total };
  }

  /**
   * Soft-delete cover letter
   */
  async deleteCoverLetter(id, userId) {
    const coverLetter = await CoverLetter.findOne({ coverLetterId: id, userId, isDeleted: false });
    if (!coverLetter) {
      throw new AppError('Cover letter not found.', 404);
    }

    coverLetter.isDeleted = true;
    await coverLetter.save();
    logger.info(`[CoverLetterService] Cover letter soft-deleted: ${id}`);
  }

  /**
   * Generate PDF Document Stream
   */
  generatePDFStream(coverLetter) {
    const doc = new PDFDocument({ margin: 50, bufferPages: true });

    // Date
    const dateStr = new Date(coverLetter.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    doc.fontSize(10).fillColor('#4B5563').text(dateStr);
    doc.moveDown(1.2);

    // Metadata block
    if (coverLetter.hiringManager) {
      doc.fontSize(11).fillColor('#1F2937').text(`To: ${coverLetter.hiringManager}`);
    } else {
      doc.fontSize(11).fillColor('#1F2937').text('To: Hiring Selection Committee');
    }
    doc.text(`Company: ${coverLetter.companyName}`);
    doc.text(`Position: ${coverLetter.jobTitle}`);
    doc.moveDown(2);

    // Subject
    doc.fontSize(12).fillColor('#111827').text(`Re: Cover Letter for ${coverLetter.jobTitle} Role`, { underline: true });
    doc.moveDown(1.5);

    // Body
    doc.fontSize(11).fillColor('#374151').text(coverLetter.coverLetterText, {
      align: 'left',
      lineGap: 4,
    });

    doc.end();
    return doc;
  }

  /**
   * Generate DOCX Document Buffer
   */
  async generateDOCXBuffer(coverLetter) {
    const dateStr = new Date(coverLetter.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: dateStr, size: 20, color: '4B5563' })],
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              children: [
                new TextRun({ text: coverLetter.hiringManager ? `To: ${coverLetter.hiringManager}\n` : 'To: Hiring Selection Committee\n', size: 22, color: '1F2937' }),
                new TextRun({ text: `Company: ${coverLetter.companyName}\n`, size: 22, color: '1F2937' }),
                new TextRun({ text: `Position: ${coverLetter.jobTitle}\n`, size: 22, color: '1F2937' }),
              ],
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              children: [
                new TextRun({ text: `Subject: Cover Letter for ${coverLetter.jobTitle} Role`, bold: true, size: 24, color: '111827' }),
              ],
            }),
            new Paragraph({ text: '' }),
            ...coverLetter.coverLetterText.split('\n\n').map((pText) => {
              // Ensure we split newlines cleanly
              const lines = pText.split('\n');
              return new Paragraph({
                children: lines.map((l, index) => new TextRun({ text: l + (index < lines.length - 1 ? '\n' : ''), size: 22, color: '374151' })),
                spacing: { after: 200 },
              });
            }),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }
}

module.exports = new CoverLetterService();
