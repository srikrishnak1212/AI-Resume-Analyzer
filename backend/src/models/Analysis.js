'use strict';

/**
 * Analysis Model — stores detailed AI resume analysis results.
 * Each document = one completed AI analysis run on a resume.
 *
 * Reference: Database.md §3.3, API.md §4, Implementation-Guide.md Phase 4
 */

const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    /** Reference to the resume analyzed */
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: [true, 'resumeId is required'],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },

    resumeHash: {
      type: String,
      required: [true, 'resumeHash is required'],
    },

    /** Version of the analysis pipeline */
    analysisVersion: {
      type: String,
      default: '1.0.0',
    },

    /** Version of the AI prompt template used */
    promptVersion: {
      type: String,
      default: '1.0.0',
    },

    /** AI service provider used (e.g. google, openai) */
    aiProvider: {
      type: String,
      default: 'google',
    },

    /** Specific AI model used (e.g. gemini-1.5-pro) */
    aiModel: {
      type: String,
      required: [true, 'aiModel is required'],
    },

    /** ATS compatibility score (0-100) */
    atsScore: {
      type: Number,
      required: [true, 'atsScore is required'],
      min: [0, 'atsScore must be at least 0'],
      max: [100, 'atsScore cannot exceed 100'],
    },

    /** Grammar and language score (0-100) */
    grammarScore: {
      type: Number,
      required: [true, 'grammarScore is required'],
      min: [0, 'grammarScore must be at least 0'],
      max: [100, 'grammarScore cannot exceed 100'],
    },

    /** Formatting and structure score (0-100) */
    formattingScore: {
      type: Number,
      required: [true, 'formattingScore is required'],
      min: [0, 'formattingScore must be at least 0'],
      max: [100, 'formattingScore cannot exceed 100'],
    },

    /** Skills match and alignment score (0-100) */
    skillsScore: {
      type: Number,
      required: [true, 'skillsScore is required'],
      min: [0, 'skillsScore must be at least 0'],
      max: [100, 'skillsScore cannot exceed 100'],
    },

    /** Work experience assessment score (0-100) */
    experienceScore: {
      type: Number,
      required: [true, 'experienceScore is required'],
      min: [0, 'experienceScore must be at least 0'],
      max: [100, 'experienceScore cannot exceed 100'],
    },

    /** Education section quality score (0-100) */
    educationScore: {
      type: Number,
      required: [true, 'educationScore is required'],
      min: [0, 'educationScore must be at least 0'],
      max: [100, 'educationScore cannot exceed 100'],
    },

    /** Projects section quality score (0-100) */
    projectsScore: {
      type: Number,
      required: [true, 'projectsScore is required'],
      min: [0, 'projectsScore must be at least 0'],
      max: [100, 'projectsScore cannot exceed 100'],
    },

    /** Professional summary quality score (0-100) */
    summaryScore: {
      type: Number,
      required: [true, 'summaryScore is required'],
      min: [0, 'summaryScore must be at least 0'],
      max: [100, 'summaryScore cannot exceed 100'],
    },

    /** Composite overall score (0-100) */
    overallScore: {
      type: Number,
      required: [true, 'overallScore is required'],
      min: [0, 'overallScore must be at least 0'],
      max: [100, 'overallScore cannot exceed 100'],
    },

    /** Identified resume strengths */
    strengths: {
      type: [String],
      default: [],
    },

    /** Identified resume weaknesses */
    weaknesses: {
      type: [String],
      default: [],
    },

    /** Actionable recommendations (equivalent to quickWins) */
    suggestions: {
      type: [String],
      default: [],
    },

    /** Skills detected in the resume */
    detectedSkills: {
      type: [String],
      default: [],
    },

    /** Skills missing for target role */
    missingSkills: {
      type: [String],
      default: [],
    },

    /** Recommended keywords to improve ATS parsing */
    recommendedKeywords: {
      type: [String],
      default: [],
    },

    /** AI generated professional summary narrative */
    professionalSummary: {
      type: String,
      default: '',
    },

    /** AI narrative summary of overall quality */
    analysisSummary: {
      type: String,
      default: '',
    },

    /** Processing time in milliseconds */
    analysisDuration: {
      type: Number,
      required: [true, 'analysisDuration is required'],
      min: [0, 'analysisDuration cannot be negative'],
    },

    /** Timestamp of the analysis execution */
    analysisTimestamp: {
      type: Date,
      default: Date.now,
    },

    /** Whether the analysis was loaded from cache */
    cached: {
      type: Boolean,
      default: false,
    },

    /** Number of times this cache entry has been hit */
    cacheHitCount: {
      type: Number,
      default: 0,
      min: [0, 'cacheHitCount cannot be negative'],
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'completed', 'failed'],
        message: 'status must be pending, processing, completed, or failed',
      },
      default: 'pending',
    },

    /** Error message if analysis failed */
    errorMessage: {
      type: String,
      default: null,
    },

    /** Soft delete flag */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    /** Timestamp of soft deletion */
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    versionKey: false,
    collection: 'resumeAnalysis', // map directly to collection named resumeAnalysis
  }
);

// ─── Indexes (Database.md §3.3) ───────────────────────────────────────────────
analysisSchema.index({ resumeId: 1 });
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ userId: 1, overallScore: 1 });
analysisSchema.index({ userId: 1, atsScore: -1 });
analysisSchema.index({ status: 1 });
analysisSchema.index({ createdAt: -1 });
analysisSchema.index({ resumeHash: 1, promptVersion: 1, analysisVersion: 1, aiModel: 1 });

// ─── Instance helpers ─────────────────────────────────────────────────────────

/** Returns public-facing representation of the analysis record */
analysisSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  obj.analysisId = obj._id.toString();
  delete obj._id;
  delete obj.isDeleted;
  delete obj.deletedAt;
  return obj;
};

module.exports = mongoose.model('Analysis', analysisSchema);
