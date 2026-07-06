'use strict';

/**
 * Prompt Builder Service
 * Reads system/user prompt templates from disk and compiles them by interpolating variables safely.
 * Wraps untrusted user content in clear boundaries to prevent prompt-injection attacks.
 *
 * Reference: Architecture.md §6.2, AI-Prompts.md §1.3, §1.7
 */

const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');

class PromptBuilder {
  /**
   * Load system and user prompt templates and interpolate variables.
   *
   * @param {object} opts
   * @param {string} opts.promptName - Folder name of the prompt (e.g. 'resumeAnalysis')
   * @param {string} [opts.version='v1'] - Prompt version folder (e.g. 'v1')
   * @param {object} opts.variables - Key-value map of template placeholders (e.g. { resumeText, targetRole, parsedSectionsJson })
   * @returns {{ systemPrompt: string, userPrompt: string }} Compiled prompts
   */
  buildPrompt({ promptName, version = 'v1', variables = {} }) {
    try {
      const promptDir = path.join(__dirname, 'prompts', promptName, version);

      const systemPath = path.join(promptDir, 'system.txt');
      const userPath = path.join(promptDir, 'user.txt');

      if (!fs.existsSync(systemPath) || !fs.existsSync(userPath)) {
        throw new AppError(
          `Prompt template not found for ${promptName} (${version}).`,
          500,
          'PROMPT_TEMPLATE_NOT_FOUND'
        );
      }

      let systemPrompt = fs.readFileSync(systemPath, 'utf8');
      let userPrompt = fs.readFileSync(userPath, 'utf8');

      // Sanitize variables: guard against prompt injection by removing direct escape strings
      const sanitizedVariables = { ...variables };
      if (sanitizedVariables.resumeText) {
        // Truncate raw text if it exceeds 100k chars for safety and performance (Testing-Strategy.md §6.5)
        if (sanitizedVariables.resumeText.length > 100_000) {
          logger.warn(`[PromptBuilder] Truncating resume text from ${sanitizedVariables.resumeText.length} to 100,000 characters.`);
          sanitizedVariables.resumeText = sanitizedVariables.resumeText.substring(0, 100_000) + '\n[Truncated...]';
        }
        // Basic sanitization
        sanitizedVariables.resumeText = this._sanitizeInput(sanitizedVariables.resumeText);
      }

      // Interpolate system prompt variables (if any)
      for (const [key, value] of Object.entries(sanitizedVariables)) {
        const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        const strValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '');
        systemPrompt = systemPrompt.replace(placeholder, strValue);
        userPrompt = userPrompt.replace(placeholder, strValue);
      }

      return { systemPrompt, userPrompt };
    } catch (err) {
      logger.error(`[PromptBuilder] Error building prompt ${promptName} (${version}): ${err.message}`);
      if (err instanceof AppError) throw err;
      throw new AppError('Failed to build AI prompt templates.', 500, 'PROMPT_BUILD_FAILED');
    }
  }

  /**
   * Remove hostile command strings or characters from input
   *
   * @param {string} input
   * @returns {string}
   * @private
   */
  _sanitizeInput(input) {
    if (!input) return '';
    // Strip out potential markdown delimiters that could compete with our wrapping delimiters
    return input
      .replace(/<<<RESUME_TEXT_START>>>/g, '')
      .replace(/<<<RESUME_TEXT_END>>>/g, '')
      .trim();
  }
}

module.exports = new PromptBuilder();
