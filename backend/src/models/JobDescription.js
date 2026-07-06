'use strict';

/**
 * JobDescription Model — stores user-pasted or uploaded job descriptions and extracted details.
 *
 * Reference: Database.md, Phase 7 Spec
 * Rule: Mongoose schema definition (PROJECT_RULES.md)
 */

const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema(
  {
    jobDescriptionId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobTitle: {
      type: String,
      trim: true,
      default: 'Untitled Role',
    },
    companyName: {
      type: String,
      trim: true,
      default: 'Unknown Company',
    },
    rawText: {
      type: String,
      required: true,
      trim: true,
    },
    parsedText: {
      type: String,
      trim: true,
    },
    fileName: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    fileType: {
      type: String,
    },
    storageKey: {
      type: String,
    },
    extractedDetails: {
      requiredSkills: {
        type: [String],
        default: [],
      },
      preferredSkills: {
        type: [String],
        default: [],
      },
      experience: {
        type: String,
        default: '',
      },
      education: {
        type: String,
        default: '',
      },
      responsibilities: {
        type: [String],
        default: [],
      },
      keywords: {
        type: [String],
        default: [],
      },
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

// Indexes for speed
jobDescriptionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
