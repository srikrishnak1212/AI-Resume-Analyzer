'use strict';

/**
 * CoverLetter Model
 *
 * Reference: Database.md, Phase 8 Spec
 * Rule: Mongoose schema definition (PROJECT_RULES.md)
 */

const mongoose = require('mongoose');

const coverLetterSchema = new mongoose.Schema(
  {
    coverLetterId: {
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
    jobDescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription',
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    hiringManager: {
      type: String,
      trim: true,
    },
    tone: {
      type: String,
      required: true,
    },
    length: {
      type: String,
      required: true,
    },
    coverLetterText: {
      type: String,
      required: true,
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
coverLetterSchema.index({ userId: 1, createdAt: -1 });
coverLetterSchema.index({ cacheHash: 1 });

module.exports = mongoose.model('CoverLetter', coverLetterSchema);
