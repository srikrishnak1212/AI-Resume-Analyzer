'use strict';

/**
 * Multer Upload Job Description Middleware
 * Configures file upload handling specifically for Job Descriptions (supports TXT, PDF, DOCX).
 * Enforces: PDF, DOCX, TXT only, max 5 MB, saves to backend/uploads/
 */

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Allowed MIME types for JDs: PDF, DOCX, Plain text
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOADS_DIR);
  },

  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (_req, file, cb) => {
  const mime = file.mimetype;
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (ALLOWED_MIME_TYPES.has(mime) || ext === '.txt') {
    cb(null, true);
  } else {
    const err = new Error('Only PDF, DOCX, and TXT files are accepted.');
    err.code = 'INVALID_FILE_TYPE';
    err.statusCode = 415;
    err.isOperational = true;
    cb(err, false);
  }
};

const uploadJobDescription = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5_242_880, // 5 MB
    files: 1,
  },
});

module.exports = uploadJobDescription;
