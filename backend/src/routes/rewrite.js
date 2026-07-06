'use strict';

const express = require('express');
const { protect } = require('../middlewares/auth');
const rewriteController = require('../controllers/rewriteController');
const {
  validateTriggerRewrite,
  validateAcceptRejectRewrite,
  validateRewriteId,
  validateRewriteQuery,
} = require('../validators/rewriteValidators');

const router = express.Router();

router.use(protect);

router.post('/', validateTriggerRewrite, rewriteController.triggerRewrite);
router.post('/accept', validateAcceptRejectRewrite, rewriteController.acceptRewrite);
router.post('/reject', validateAcceptRejectRewrite, rewriteController.rejectRewrite);
router.get('/history', validateRewriteQuery, rewriteController.listRewrites);
router.get('/:id', validateRewriteId, rewriteController.getRewrite);
router.delete('/:id', validateRewriteId, rewriteController.deleteRewrite);

module.exports = router;
