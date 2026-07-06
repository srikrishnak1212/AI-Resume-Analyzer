'use strict';

/**
 * Retry Manager Service
 * Manages request retries for AI operations.
 * Handles transient network errors, rate limits, and timeouts with exponential backoff.
 * Handles validation and JSON failures with a single corrective self-correction retry.
 * Ceiling: Maximum 3 attempts in total.
 *
 * Reference: AI-Prompts.md §1.8, §1.9, Testing-Strategy.md §6.6, §6.7
 */

const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');
const responseValidator = require('./ResponseValidator');

class RetryManager {
  /**
   * Run the AI provider call inside a retry loop.
   *
   * @param {object} opts
   * @param {AiProvider} opts.provider - AI provider client (e.g. GeminiClient)
   * @param {string} opts.resumeText - Parsing output
   * @param {object} opts.parsedSections - Sections
   * @param {object} opts.promptOptions - System and User compiled prompts, model configuration
   * @returns {Promise<object>} Validated analysis JSON object
   */
  async executeWithRetry(opts) {
    const { provider, resumeText, parsedSections, promptOptions } = opts;
    const maxAttempts = 3;
    let attempt = 0;
    let correctiveRetryTriggered = false;

    let currentSystemPrompt = promptOptions.systemPrompt;
    let currentUserPrompt = promptOptions.userPrompt;

    while (attempt < maxAttempts) {
      attempt++;
      logger.info(`[RetryManager] Running AI analysis attempt ${attempt}/${maxAttempts}...`);

      try {
        // 1. Invoke Gemini/LLM
        const rawResponse = await provider.analyzeResume(resumeText, parsedSections, {
          ...promptOptions,
          systemPrompt: currentSystemPrompt,
          userPrompt: currentUserPrompt,
        });

        // 2. Validate response structure
        const validatedData = responseValidator.validate(rawResponse);

        // Success!
        logger.info(`[RetryManager] Analysis succeeded on attempt ${attempt}.`);
        return validatedData;
      } catch (err) {
        logger.error(`[RetryManager] Attempt ${attempt} failed: ${err.message}`);

        // Decide if the error is a validation error (JSON / Schema parsing)
        const isValidationError =
          err.code === 'AI_JSON_PARSE_FAILED' || err.code === 'AI_SCHEMA_VALIDATION_FAILED';

        // Check if we have attempts left
        if (attempt >= maxAttempts) {
          logger.error('[RetryManager] Max attempts reached. Failing AI analysis.');
          throw err;
        }

        if (isValidationError) {
          // If it is a validation error, we run exactly ONE corrective self-correction retry (AI-Prompts.md §1.9)
          if (correctiveRetryTriggered) {
            logger.warn('[RetryManager] Corrective retry already attempted. Failing.');
            throw err;
          }

          correctiveRetryTriggered = true;
          logger.warn(`[RetryManager] Response validation failed. Triggering corrective retry with error details.`);

          // Append corrective feedback to the user prompt
          const errorSnippet = err.details
            ? JSON.stringify(err.details)
            : err.message;
          currentUserPrompt = `${promptOptions.userPrompt}\n\n[SYSTEM WARNING: Your previous response was invalid. Error: ${errorSnippet}. Correct the errors and return ONLY a valid JSON object matching the required schema. Do not include explanation text.]`;
          
          // No delay for validation corrective retry
          continue;
        }

        // Check if error is transient (network timeout, rate limit 429, server 5xx)
        const isTransient = this._isTransientError(err);
        if (!isTransient) {
          // Non-transient error (invalid API key, auth failure, bad prompt template) -> Do NOT retry (API-Prompts.md §1.8)
          logger.error(`[RetryManager] Non-transient error detected (${err.code || err.message}). Aborting retries.`);
          throw err;
        }

        // Exponential backoff delay (e.g. 1.5s for attempt 1, 3s for attempt 2)
        const backoffMs = attempt * 1500;
        logger.info(`[RetryManager] Transient error. Waiting ${backoffMs}ms before retrying...`);
        await this._sleep(backoffMs);
      }
    }
  }

  /**
   * Helper to check if an error is transient
   *
   * @param {Error} err
   * @returns {boolean}
   * @private
   */
  _isTransientError(err) {
    // API keys errors, authentication failures, bad arguments etc. are NOT transient
    const message = err.message ? err.message.toLowerCase() : '';
    const code = err.code ? String(err.code).toLowerCase() : '';

    if (
      message.includes('api key') ||
      message.includes('auth') ||
      message.includes('key not found') ||
      code.includes('invalid_key') ||
      code.includes('unauthorized') ||
      err.status === 401 ||
      err.status === 403
    ) {
      return false;
    }

    // Default to true for network issues, 429 rate limit, 500 server errors, timeout, abort, etc.
    return true;
  }

  /**
   * Promise-based delay helper
   *
   * @param {number} ms
   * @returns {Promise<void>}
   * @private
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new RetryManager();
