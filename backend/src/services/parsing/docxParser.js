'use strict';

/**
 * DOCX Parser — wraps mammoth to extract plain text from DOCX buffers.
 *
 * Reference: Implementation-Guide.md Phase 3 (mammoth wrapper)
 * Rule: Services handle logic, async/await (PROJECT_RULES.md)
 */

const mammoth = require('mammoth');
const logger = require('../../utils/logger');

/**
 * Parse a DOCX file and return extracted plain text.
 *
 * @param {Buffer} buffer — file buffer
 * @param {string} fileName — used for logging only
 * @returns {Promise<{ text: string, pageCount: number }>}
 */
const parseDocx = async (buffer, fileName = 'unknown.docx') => {
  try {
    const result = await mammoth.extractRawText({ buffer });

    const text = (result.value || '').trim();

    // mammoth does not provide a native page count; estimate 1 page per 500 words
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const pageCount = Math.max(1, Math.round(wordCount / 500));

    if (result.messages && result.messages.length > 0) {
      result.messages.forEach((msg) => {
        logger.warn(`[docxParser] "${fileName}" — ${msg.type}: ${msg.message}`);
      });
    }

    logger.info(`[docxParser] Parsed "${fileName}": ${text.length} chars, ~${pageCount} pages`);

    return { text, pageCount };
  } catch (err) {
    logger.error(`[docxParser] Failed to parse "${fileName}": ${err.message}`);
    throw new Error(`DOCX parsing failed: ${err.message}`);
  }
};

module.exports = { parseDocx };
