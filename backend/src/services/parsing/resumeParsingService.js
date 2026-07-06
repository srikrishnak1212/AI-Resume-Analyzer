'use strict';

/**
 * Resume Parsing Service — handles the unified PDF/DOCX parsing and section extraction.
 * Updates the database record with the parsing progress and output.
 *
 * Reference: Implementation-Guide.md Phase 3 & Phase 4, Database.md §3.2
 */

const fs = require('fs');
const path = require('path');
const Resume = require('../../models/Resume');
const { parsePdf } = require('./pdfParser');
const { parseDocx } = require('./docxParser');
const { extractSections, countWords } = require('./sectionExtractor');
const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');

/**
 * Asynchronously or synchronously parses a resume file and updates its database record.
 * Handles parsing status transitions: Pending -> Processing -> Completed or Failed.
 *
 * @param {string} resumeId — MongoDB ObjectId of the Resume document
 * @returns {Promise<Resume>} the updated Resume document
 */
const parseResume = async (resumeId) => {
  const resume = await Resume.findById(resumeId);
  if (!resume) {
    logger.error(`[resumeParsingService] Resume not found: ${resumeId}`);
    throw new AppError('Resume not found.', 404, 'NOT_FOUND');
  }

  // 1. Transition status to Processing
  resume.parsingStatus = 'Processing';
  await resume.save();
  logger.info(`[resumeParsingService] Parsing started for Resume: ${resumeId} (${resume.fileName})`);

  try {
    const filePath = path.resolve(process.cwd(), resume.storageKey);

    // Verify file exists on local storage
    if (!fs.existsSync(filePath)) {
      throw new Error('Backing storage file does not exist on disk.');
    }

    const buffer = fs.readFileSync(filePath);
    let parsedText = null;
    let pageCount = null;

    // Trigger format-specific extraction
    if (resume.fileType === 'application/pdf') {
      const parsed = await parsePdf(buffer, resume.fileName);
      parsedText = parsed.text;
      pageCount = parsed.pageCount;
    } else if (
      resume.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const parsed = await parseDocx(buffer, resume.fileName);
      parsedText = parsed.text;
      pageCount = parsed.pageCount;
    } else {
      throw new Error(`Unsupported MIME type: ${resume.fileType}`);
    }

    // Sanity check: Ensure we got some readable text back
    if (!parsedText || parsedText.trim().length < 10) {
      throw new Error(
        'Empty or unreadable text extracted. The file may be corrupted, password-protected, or an image-only scan with no OCR text.'
      );
    }

    // 2. Segment document sections & compute words
    const wordCount = countWords(parsedText);
    const sections = extractSections(parsedText);

    // 3. Persist success
    resume.parsedText = parsedText;
    resume.sections = sections;
    resume.wordCount = wordCount;
    resume.pageCount = pageCount;
    resume.parsingStatus = 'Completed';
    resume.parsingError = null;
    resume.parsedAt = new Date();

    const updated = await resume.save();
    logger.info(`[resumeParsingService] Parsing successfully completed for Resume: ${resumeId}`);
    return updated;
  } catch (err) {
    // 4. Handle parsing errors gracefully and persist failure status
    resume.parsingStatus = 'Failed';
    resume.parsingError = err.message || 'An unknown error occurred during parsing.';
    resume.parsedAt = new Date();

    const updated = await resume.save();
    logger.error(
      `[resumeParsingService] Parsing failed for Resume: ${resumeId}. Error: ${err.message}`
    );
    return updated;
  }
};

module.exports = { parseResume };
