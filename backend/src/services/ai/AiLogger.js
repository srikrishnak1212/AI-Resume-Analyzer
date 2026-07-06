'use strict';

/**
 * AI Logger Service
 * Handles recording structured logs of every AI provider interaction in the database.
 * Used for billing estimations, performance monitoring, and debugging.
 *
 * Reference: Architecture.md §17, AI-Prompts.md §18
 */

const { v4: uuidv4 } = require('uuid');
const AiLog = require('../../models/AiLog');
const logger = require('../../utils/logger');

class AiLogger {
  /**
   * Log an AI call to the database.
   *
   * @param {object} logData
   * @param {string} [logData.requestId] - Unique ID (generates UUID if missing)
   * @param {string} logData.resumeId - ID of resume analyzed
   * @param {string} logData.userId - User who called
   * @param {string} logData.provider - LLM provider
   * @param {string} logData.model - LLM model
   * @param {string} logData.promptVersion - Prompt template version
   * @param {string} logData.analysisVersion - Analysis logic version
   * @param {number} logData.responseTime - Latency in ms
   * @param {number} [logData.estimatedTokens=0] - Estimated tokens count
   * @param {boolean} [logData.cached=false] - Was this call cached?
   * @param {string} logData.status - 'success' or 'failure'
   * @param {string} [logData.errorMessage=null] - Error description if failed
   * @returns {Promise<AiLog>} The saved log document
   */
  async logAiRequest(logData) {
    try {
      const data = {
        requestId: logData.requestId || uuidv4(),
        resumeId: logData.resumeId,
        userId: logData.userId,
        provider: logData.provider,
        model: logData.model,
        promptVersion: logData.promptVersion || '1.0.0',
        analysisVersion: logData.analysisVersion || '1.0.0',
        responseTime: logData.responseTime,
        estimatedTokens: logData.estimatedTokens || 0,
        cached: logData.cached || false,
        status: logData.status,
        errorMessage: logData.errorMessage || null,
      };

      const logRecord = await AiLog.create(data);
      logger.info(`[AiLogger] Logged AI request: ${data.requestId} - Status: ${data.status} (${data.responseTime}ms)`);
      return logRecord;
    } catch (err) {
      // Non-fatal: do not block the user flow if audit logging fails, just log locally
      logger.error(`[AiLogger] Failed to write AI audit log to DB: ${err.message}`);
      return null;
    }
  }
}

module.exports = new AiLogger();
