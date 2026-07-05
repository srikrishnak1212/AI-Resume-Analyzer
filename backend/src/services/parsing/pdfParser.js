'use strict';

/**
 * PDF Parser — wraps pdf-parse to extract raw text from PDF buffers.
 *
 * Reference: Implementation-Guide.md Phase 3 (pdf-parse wrapper)
 * Rule: Services handle logic, async/await, no duplicated code (PROJECT_RULES.md)
 */

const pdfParse = require('pdf-parse');
const logger = require('../../utils/logger');

/**
 * Parse a PDF file and return extracted text + page count.
 *
 * @param {Buffer} buffer — file buffer
 * @param {string} fileName — used for logging only
 * @returns {Promise<{ text: string, pageCount: number }>}
 */
const parsePdf = async (buffer, fileName = 'unknown.pdf') => {
  try {
    const data = await pdfParse(buffer);

    const text = (data.text || '').trim();
    const pageCount = data.numpages || 1;

    logger.info(`[pdfParser] Parsed "${fileName}": ${text.length} chars, ${pageCount} pages`);

    return { text, pageCount };
  } catch (err) {
    logger.error(`[pdfParser] Failed to parse "${fileName}": ${err.message}`);
    throw new Error(`PDF parsing failed: ${err.message}`);
  }
};

module.exports = { parsePdf };
