'use strict';

const express = require('express');
const { protect } = require('../middlewares/auth');
const coverLetterController = require('../controllers/coverLetterController');
const {
  validateGenerateCoverLetter,
  validateCoverLetterId,
  validateCoverLetterQuery,
} = require('../validators/coverLetterValidators');

const router = express.Router();

router.use(protect);

router.post('/', validateGenerateCoverLetter, coverLetterController.generateCoverLetter);
router.get('/history', validateCoverLetterQuery, coverLetterController.listCoverLetters);
router.get('/:id', validateCoverLetterId, coverLetterController.getCoverLetter);
router.delete('/:id', validateCoverLetterId, coverLetterController.deleteCoverLetter);
router.get('/:id/download/pdf', validateCoverLetterId, coverLetterController.downloadPDF);
router.get('/:id/download/docx', validateCoverLetterId, coverLetterController.downloadDOCX);

module.exports = router;
