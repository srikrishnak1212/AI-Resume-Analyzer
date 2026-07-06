'use strict';

/**
 * AiProvider Base Interface / Abstract Class
 * Defines the contract that all LLM clients must implement.
 * This guarantees our controller/service logic is agnostic to the LLM vendor (Gemini, OpenAI, Claude, etc.)
 *
 * Reference: Architecture.md §6.3, SRS §25
 */
class AiProvider {
  /**
   * Analyze a parsed resume using LLM
   *
   * @param {string} resumeText - Full raw text of the resume
   * @param {object} parsedSections - Pre-parsed section mapping
   * @param {object} [options] - Additional parameters like targetRole, systemPrompt, userPrompt
   * @returns {Promise<object>} Parsed, validated analysis JSON
   */
  async analyzeResume(resumeText, parsedSections, options = {}) {
    throw new Error('Method "analyzeResume" must be implemented by the provider.');
  }
}

module.exports = AiProvider;
