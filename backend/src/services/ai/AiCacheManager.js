'use strict';

/**
 * AI Cache Manager Service
 * Manages checking, retrieving, and updating cached analysis results by comparing resume content hashes.
 * Helps minimize model costs and latency for identical resume uploads.
 *
 * Reference: Architecture.md §6.6, Database.md §10.4, AI-Prompts.md §1.10
 */

const crypto = require('crypto');
const Analysis = require('../../models/Analysis');
const logger = require('../../utils/logger');

class AiCacheManager {
  /**
   * Generate SHA-256 hash of resume parsed text.
   *
   * @param {string} text - Resume parsed text content
   * @returns {string} SHA-256 hex digest
   */
  generateHash(text) {
    if (!text) return '';
    return crypto.createHash('sha256').update(text.trim()).digest('hex');
  }

  /**
   * Search for an existing completed analysis document.
   *
   * @param {object} opts
   * @param {string} opts.resumeHash - SHA-256 text hash
   * @param {string} opts.promptVersion - AI prompt template version
   * @param {string} opts.analysisVersion - Pipeline version
   * @param {string} opts.aiModel - AI model name
   * @returns {Promise<Analysis|null>} Cached analysis document or null
   */
  async findCachedAnalysis({ resumeHash, promptVersion, analysisVersion, aiModel }) {
    try {
      const match = await Analysis.findOne({
        resumeHash,
        promptVersion,
        analysisVersion,
        aiModel,
        status: 'completed',
        isDeleted: false,
      }).sort({ createdAt: -1 }); // get the latest if multiple exist

      if (match) {
        logger.info(`[AiCacheManager] Cache HIT found for hash ${resumeHash.substring(0, 10)}... (Analysis ID: ${match._id})`);
        return match;
      }

      logger.info(`[AiCacheManager] Cache MISS for hash ${resumeHash.substring(0, 10)}...`);
      return null;
    } catch (err) {
      logger.error(`[AiCacheManager] Cache lookup error: ${err.message}`);
      return null; // fallback gracefully to cache miss
    }
  }

  /**
   * Increment cache statistics for a cached analysis record.
   *
   * @param {string} analysisId - ID of original analysis
   * @returns {Promise<void>}
   */
  async incrementCacheHits(analysisId) {
    try {
      await Analysis.findByIdAndUpdate(analysisId, {
        $inc: { cacheHitCount: 1 },
      });
      logger.info(`[AiCacheManager] Incremented cache hit count for Analysis ${analysisId}`);
    } catch (err) {
      logger.error(`[AiCacheManager] Error incrementing cache hits: ${err.message}`);
    }
  }
}

module.exports = new AiCacheManager();
