'use strict';

/**
 * Report Cache Manager Service
 * Manages checking if reports already exist on disk and in DB, avoiding unnecessary regeneration.
 *
 * Reference: Phase 6C Caching Strategy
 */

const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');

/**
 * Check if a valid cached report exists for the given analysis
 *
 * @param {string} analysisId
 * @returns {Promise<object|null>} Report instance if valid cache exists, else null
 */
const checkCachedReport = async (analysisId) => {
  const existingReport = await Report.findOne({ analysisId });
  if (!existingReport) {
    return null;
  }

  // Verify files actually exist on disk
  if (existingReport.status === 'Completed' && existingReport.pdfPath && existingReport.jsonPath) {
    const pdfExists = fs.existsSync(existingReport.pdfPath);
    const jsonExists = fs.existsSync(existingReport.jsonPath);

    if (pdfExists && jsonExists) {
      return existingReport;
    }
  }

  return null;
};

/**
 * Clean up files on disk associated with a report
 *
 * @param {object} report - Report model instance
 * @returns {Promise<void>}
 */
const clearReportFiles = async (report) => {
  if (report.pdfPath && fs.existsSync(report.pdfPath)) {
    try {
      await fs.promises.unlink(report.pdfPath);
    } catch (err) {
      // Log error but continue
    }
  }
  if (report.jsonPath && fs.existsSync(report.jsonPath)) {
    try {
      await fs.promises.unlink(report.jsonPath);
    } catch (err) {
      // Log error but continue
    }
  }
};

module.exports = {
  checkCachedReport,
  clearReportFiles,
};
