'use strict';

/**
 * Response Validator Service
 * Implements the 3-stage validation pipeline for AI responses:
 * Stage 1: Syntactic parsing (JSON formatting check)
 * Stage 2: Schema validation (Zod schema checking)
 * Stage 3: Semantic/Business logic validation (Score avg, bounds, length checks)
 *
 * Reference: AI-Prompts.md §1.6, Testing-Strategy.md §6.2, §6.3
 */

const { z } = require('zod');
const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const grammarIssueSchema = z.object({
  section: z.string().trim(),
  issue: z.string().trim(),
});

const sectionFeedbackSchema = z.object({
  feedback: z.string().trim().min(5, 'Section feedback must be at least 5 characters long'),
  score: z.number().int().min(0).max(100),
});

const analysisResponseSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  atsScore: z.number().int().min(0).max(100),
  grammarScore: z.number().int().min(0).max(100),
  formattingScore: z.number().int().min(0).max(100),
  skillsScore: z.number().int().min(0).max(100),
  experienceScore: z.number().int().min(0).max(100),
  summaryScore: z.number().int().min(0).max(100),
  educationScore: z.number().int().min(0).max(100),
  projectsScore: z.number().int().min(0).max(100),
  scoreSummary: z.string().trim().min(10, 'Score summary must be at least 10 characters long'),
  strengths: z.array(z.string().trim()).min(1, 'At least one strength is required'),
  weaknesses: z.array(z.string().trim()).min(1, 'At least one weakness is required'),
  quickWins: z.array(z.string().trim()).min(1, 'At least one quick win/suggestion is required'),
  atsAnalysis: z.object({
    passedChecks: z.array(z.string().trim()),
    failedChecks: z.array(z.string().trim()),
    keywordsFound: z.array(z.string().trim()),
    keywordsMissing: z.array(z.string().trim()),
    formatWarnings: z.array(z.string().trim()),
  }),
  grammarAnalysis: z.object({
    issues: z.array(grammarIssueSchema),
    suggestions: z.array(z.string().trim()),
    toneAssessment: z.string().trim(),
  }),
  formattingAnalysis: z.object({
    issues: z.array(z.string().trim()),
    suggestions: z.array(z.string().trim()),
    lengthAssessment: z.string().trim(),
  }),
  sectionReviews: z.object({
    summary: sectionFeedbackSchema,
    experience: sectionFeedbackSchema,
    education: sectionFeedbackSchema,
    skills: sectionFeedbackSchema,
    projects: sectionFeedbackSchema,
  }),
  skillsAnalysis: z.object({
    detectedSkills: z.array(z.string().trim()),
    hardSkills: z.array(z.string().trim()),
    softSkills: z.array(z.string().trim()),
    missingSkills: z.array(z.string().trim()),
    trendingSkills: z.array(z.string().trim()),
  }),
});

class ResponseValidator {
  /**
   * Validate raw text string returned by Gemini.
   *
   * @param {string} rawText
   * @returns {object} Validated JSON object
   * @throws {AppError} if any stage fails
   */
  validate(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      throw new AppError('Received empty response from AI model.', 502, 'AI_EMPTY_RESPONSE');
    }

    // ── Stage 1: Syntactic parsing ─────────────────────────────────────────────
    let cleanText = rawText.trim();
    // Strip markdown code fences if present (e.g. ```json ... ```)
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanText);
    } catch (err) {
      logger.error('[ResponseValidator] Syntactic JSON parsing failed.');
      throw new AppError('AI response is not valid JSON.', 422, 'AI_JSON_PARSE_FAILED', [
        { message: err.message, rawResponseSnippet: rawText.substring(0, 200) }
      ]);
    }

    // ── Stage 2: Schema validation ──────────────────────────────────────────────
    let schemaValidated;
    try {
      schemaValidated = analysisResponseSchema.parse(parsedJson);
    } catch (err) {
      logger.error('[ResponseValidator] Zod schema validation failed.');
      const details = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw new AppError('AI response does not match the required schema.', 422, 'AI_SCHEMA_VALIDATION_FAILED', details);
    }

    // ── Stage 3: Semantic/Business validation ──────────────────────────────────
    this._semanticSanityChecks(schemaValidated);

    return schemaValidated;
  }

  /**
   * Validates semantic constraints (scores averages, consistency rules).
   *
   * @param {object} data
   * @private
   */
  _semanticSanityChecks(data) {
    const scores = [
      data.atsScore,
      data.grammarScore,
      data.formattingScore,
      data.skillsScore,
      data.experienceScore,
      data.summaryScore,
      data.educationScore,
      data.projectsScore,
    ];

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const diff = Math.abs(data.overallScore - avgScore);

    // AI-Prompts.md §2.4: overallScore must be within ±10 of the simple average of dimensions.
    // Flag or warn instead of throw, but let's log a warning to follow guidelines.
    if (diff > 10) {
      logger.warn(
        `[ResponseValidator] Semantic warning: overallScore (${data.overallScore}) deviates from average score (${avgScore.toFixed(
          1
        )}) by more than 10 points.`
      );
    }

    // Ensure scores are in valid 0-100 range
    scores.push(data.overallScore);
    const outOfBounds = scores.some((s) => s < 0 || s > 100);
    if (outOfBounds) {
      throw new AppError(
        'AI response contains scores outside the valid 0-100 range.',
        422,
        'AI_SCORE_OUT_OF_BOUNDS'
      );
    }

    // Sanity checks on keyword lists
    if (data.atsAnalysis.keywordsFound.length === 0 && data.atsAnalysis.keywordsMissing.length === 0) {
      throw new AppError(
        'AI response has empty keyword lists. ATS analysis requires at least keywords found or missing.',
        422,
        'AI_SEMANTIC_KEYWORDS_EMPTY'
      );
    }
  }
}

module.exports = new ResponseValidator();
