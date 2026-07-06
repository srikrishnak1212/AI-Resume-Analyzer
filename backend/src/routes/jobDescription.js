'use strict';

const express = require('express');
const { protect } = require('../middlewares/auth');
const uploadJobDescription = require('../middlewares/uploadJobDescription');
const jobMatchController = require('../controllers/jobMatchController');
const { validateJobDescriptionText } = require('../validators/jobMatchValidators');

const router = express.Router();

router.use(protect);

// ── Upload raw text JD ────────────────────────────────────────────────────────
router.post(
  '/text',
  validateJobDescriptionText,
  jobMatchController.createTextJobDescription
);

// ── Upload file JD ────────────────────────────────────────────────────────────
router.post(
  '/upload',
  uploadJobDescription.single('jobDescription'), // field name "jobDescription"
  jobMatchController.uploadFileJobDescription
);

module.exports = router;
