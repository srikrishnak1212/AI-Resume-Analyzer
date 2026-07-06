'use strict';

/**
 * JobMatch Model — stores evaluation results comparing a resume with a job description.
 *
 * Reference: Database.md, Phase 7 Spec
 * Rule: Mongoose schema definition (PROJECT_RULES.md)
 */

const mongoose = require('mongoose');

const jobMatchSchema = new mongoose.Schema(
  {
    jobMatchId: {
      type: String,
      required: true,
      unique: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    jobDescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    sectionScores: {
      technicalSkillsScore: { type: Number, default: 0 },
      softSkillsScore: { type: Number, default: 0 },
      experienceScore: { type: Number, default: 0 },
      educationScore: { type: Number, default: 0 },
      projectsScore: { type: Number, default: 0 },
      keywordScore: { type: Number, default: 0 },
      atsCompatibilityScore: { type: Number, default: 0 },
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    matchedKeywords: {
      type: [String],
      default: [],
    },
    missingKeywords: {
      type: [String],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    resumeImprovements: {
      type: [String],
      default: [],
    },
    priorityActions: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: '',
    },
    confidenceScore: {
      type: Number,
      default: 0,
    },
    aiModel: {
      type: String,
      required: true,
    },
    promptVersion: {
      type: String,
      required: true,
    },
    analysisVersion: {
      type: String,
      required: true,
    },
    resumeHash: {
      type: String,
      required: true,
    },
    jobDescriptionHash: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance and quick caching lookup
jobMatchSchema.index({ userId: 1, createdAt: -1 });
jobMatchSchema.index({ resumeHash: 1, jobDescriptionHash: 1, promptVersion: 1, aiModel: 1, analysisVersion: 1 });

module.exports = mongoose.model('JobMatch', jobMatchSchema);
