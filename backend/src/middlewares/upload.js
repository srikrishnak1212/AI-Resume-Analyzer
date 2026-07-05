'use strict';

/**
 * Multer Upload Middleware — configures file upload handling.
 * Enforces: PDF/DOCX only, max 5 MB, saves to backend/uploads/
 *
 * Reference: Implementation-Guide.md Phase 3, API.md §1.6 (413/415 codes),
 *            Database.md §3.2 (fileType, fileSize validation)
 */

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// ─── Ensure uploads directory exists ─────────────────────────────────────────
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ─── Allowed MIME types ───────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

// ─── Disk storage configuration ───────────────────────────────────────────────
const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOADS_DIR);
  },

  filename(_req, file, cb) {
    // Sanitize: strip non-alphanumeric chars (except dot/hyphen/underscore)
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

// ─── MIME-type filter ─────────────────────────────────────────────────────────
const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    // Pass a custom error — caught by errorHandler as 415
    const err = new Error('Only PDF and DOCX files are accepted.');
    err.code = 'INVALID_FILE_TYPE';
    err.statusCode = 415;
    err.isOperational = true;
    cb(err, false);
  }
};

// ─── Multer instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5_242_880, // 5 MB — matches Database.md §3.2 validation
    files: 1,            // one file per request
  },
});

module.exports = upload;
