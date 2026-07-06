'use strict';

/**
 * AiLog Model — audits and monitors every AI call made by the system.
 *
 * Reference: Architecture.md §17, AI-Prompts.md §1.9, §18
 */

const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema(
  {
    /** Unique request UUID (can map from X-Request-ID) */
    requestId: {
      type: String,
      required: true,
      index: true,
    },

    /** Resume ID associated with the request (optional, some calls might not be resume-specific) */
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      index: true,
      default: null,
    },

    /** User who initiated the AI call */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },

    /** AI service provider (e.g. google) */
    provider: {
      type: String,
      required: true,
    },

    /** Specific AI model invoked (e.g. gemini-1.5-pro) */
    model: {
      type: String,
      required: true,
    },

    /** Version of the prompt used */
    promptVersion: {
      type: String,
      required: true,
    },

    /** Version of the analysis logic */
    analysisVersion: {
      type: String,
      required: true,
    },

    /** Latency / processing response time in milliseconds */
    responseTime: {
      type: Number,
      required: true,
      min: 0,
    },

    /** Estimated token count used in the request + response */
    estimatedTokens: {
      type: Number,
      default: 0,
      min: 0,
    },

    /** Whether the call was served from cache */
    cached: {
      type: Boolean,
      default: false,
    },

    /** Status of the invocation ('success' or 'failure') */
    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
      index: true,
    },

    /** Detailed error message if status is 'failure' */
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only createdAt is needed
    versionKey: false,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
aiLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AiLog', aiLogSchema);
