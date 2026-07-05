'use strict';

/**
 * Resume Model — stores resume file metadata and parsed content.
 * Each document = one uploaded resume version per user.
 *
 * Reference: Database.md §3.2, SRS FR-04, FR-05, FR-20
 */

const mongoose = require('mongoose');

// ─── Contact Info sub-schema ──────────────────────────────────────────────────
const contactInfoSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    website: { type: String, trim: true },
    location: { type: String, trim: true },
  },
  { _id: false }
);

// ─── Sections sub-schema ──────────────────────────────────────────────────────
const sectionsSchema = new mongoose.Schema(
  {
    contactInfo: { type: contactInfoSchema, default: null },
    summary: { type: String, default: null },
    experience: { type: [mongoose.Schema.Types.Mixed], default: [] },
    education: { type: [mongoose.Schema.Types.Mixed], default: [] },
    skills: { type: [String], default: [] },
    projects: { type: [mongoose.Schema.Types.Mixed], default: [] },
    certifications: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
  },
  { _id: false }
);

// ─── Resume schema ────────────────────────────────────────────────────────────
const resumeSchema = new mongoose.Schema(
  {
    /** Reference to the owning user */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },

    /** Original uploaded file name (as provided by the client) */
    fileName: {
      type: String,
      required: [true, 'fileName is required'],
      trim: true,
      maxlength: [255, 'fileName must be 255 characters or fewer'],
    },

    /** File size in bytes — max 5 MB (5,242,880 bytes) */
    fileSize: {
      type: Number,
      required: [true, 'fileSize is required'],
      min: [1, 'fileSize must be at least 1 byte'],
      max: [5_242_880, 'fileSize cannot exceed 5 MB'],
    },

    /** MIME type — only PDF or DOCX accepted */
    fileType: {
      type: String,
      required: [true, 'fileType is required'],
      enum: {
        values: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        message: 'fileType must be application/pdf or DOCX MIME type',
      },
    },

    /** Full path to the file on disk (local) or URL (cloud) */
    storageUrl: {
      type: String,
      required: [true, 'storageUrl is required'],
    },

    /** Storage key — unique identifier / relative path used to retrieve the file */
    storageKey: {
      type: String,
      required: [true, 'storageKey is required'],
    },

    /** Sequential version number per user — auto-incremented by resumeService */
    versionNumber: {
      type: Number,
      required: [true, 'versionNumber is required'],
      min: [1, 'versionNumber must be at least 1'],
    },

    /** Optional human-readable label for this version */
    versionLabel: {
      type: String,
      trim: true,
      maxlength: [50, 'versionLabel must be 50 characters or fewer'],
      default: null,
    },

    /** Raw text extracted from the file */
    parsedText: {
      type: String,
      default: null,
    },

    /** Structured section breakdown of the resume */
    sections: {
      type: sectionsSchema,
      default: () => ({}),
    },

    /** Total word count of parsed text */
    wordCount: {
      type: Number,
      default: 0,
      min: [0, 'wordCount cannot be negative'],
    },

    /** Estimated page count */
    pageCount: {
      type: Number,
      default: null,
      min: [1, 'pageCount must be at least 1'],
      max: [10, 'pageCount cannot exceed 10'],
    },

    /** Parsing pipeline status */
    parsingStatus: {
      type: String,
      enum: {
        values: ['pending', 'success', 'failed'],
        message: 'parsingStatus must be pending, success, or failed',
      },
      default: 'pending',
    },

    /** Error message if parsing failed */
    parsingError: {
      type: String,
      default: null,
    },

    /** AI analysis pipeline status */
    analysisStatus: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'completed', 'failed'],
        message: 'analysisStatus must be pending, processing, completed, or failed',
      },
      default: 'pending',
    },

    /** Soft delete flag */
    isDeleted: {
      type: Boolean,
      default: false,
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
  }
);

// ─── Indexes (Database.md §3.2) ───────────────────────────────────────────────
resumeSchema.index({ userId: 1, createdAt: -1 });       // primary history list query
resumeSchema.index({ userId: 1, versionNumber: -1 });   // latest version lookup
resumeSchema.index({ userId: 1, isDeleted: 1 });        // soft-delete filtered queries
resumeSchema.index({ storageKey: 1 }, { unique: true }); // storage deduplication
resumeSchema.index({ parsingStatus: 1 });               // background job polling
resumeSchema.index({ analysisStatus: 1 });              // background job polling

// ─── Instance helpers ─────────────────────────────────────────────────────────

/** Returns a safe public representation (no storageKey exposed) */
resumeSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.storageKey;      // keep storage path internal
  delete obj.isDeleted;
  delete obj.deletedAt;
  return obj;
};

module.exports = mongoose.model('Resume', resumeSchema);
