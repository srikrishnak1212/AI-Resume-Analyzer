'use strict';

/**
 * RefreshToken Model — Mongoose Schema
 * Stores hashed refresh tokens with TTL auto-expiry.
 * Reference: Implementation-Guide.md Phase 2, Architecture.md §7
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const refreshTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      // TTL index — MongoDB removes documents automatically on expiry
      index: { expires: 0 },
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // Client metadata for security auditing
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

// Note: userId index is declared inline; expiresAt TTL index is declared inline via { expires: 0 }

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
