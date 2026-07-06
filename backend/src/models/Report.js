'use strict';

/**
 * Report Model
 *
 * Reference: Database.md, Phase 6C Spec
 * Rule: Mongoose schema definition (PROJECT_RULES.md)
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
    },
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportVersion: {
      type: Number,
      default: 1,
    },
    reportType: {
      type: String,
      default: 'PDF',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloaded: {
      type: Date,
    },
    pdfPath: {
      type: String,
    },
    jsonPath: {
      type: String,
    },
    cached: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance
reportSchema.index({ userId: 1 });
reportSchema.index({ analysisId: 1 });

module.exports = mongoose.model('Report', reportSchema);
