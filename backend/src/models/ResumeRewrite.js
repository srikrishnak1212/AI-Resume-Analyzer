'use strict';

/**
 * ResumeRewrite Model
 *
 * Reference: Database.md, Phase 8 Spec
 * Rule: Mongoose schema definition (PROJECT_RULES.md)
 */

const mongoose = require('mongoose');

const resumeRewriteSchema = new mongoose.Schema(
  {
    rewriteId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    sectionName: {
      type: String,
      required: true,
    },
    rewriteMode: {
      type: String,
      required: true,
    },
    originalContent: {
      type: String,
      required: true,
    },
    rewrittenContent: {
      type: String,
      required: true,
    },
    improvements: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
    newResumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
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
    cacheHash: {
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

// Indexes
resumeRewriteSchema.index({ userId: 1, createdAt: -1 });
resumeRewriteSchema.index({ cacheHash: 1 });

module.exports = mongoose.model('ResumeRewrite', resumeRewriteSchema);
