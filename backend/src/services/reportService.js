'use strict';

/**
 * Report Service
 * Coordinates database storage, caching checks, file writing, and downloads.
 *
 * Reference: Phase 6C Specification, Database.md
 */

const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');
const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const User = require('../models/User');
const { generatePDFReport } = require('./pdfGenerator');
const { generateJSONReport } = require('./jsonExportService');
const { checkCachedReport, clearReportFiles } = require('./reportCacheManager');
const AppError = require('../utils/AppError');

class ReportService {
  /**
   * List reports for a user with pagination
   */
  async listReports(userId, page = 1, limit = 10) {
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const offset = (parsedPage - 1) * parsedLimit;

    const query = { userId, status: 'Completed' };

    const [total, reports] = await Promise.all([
      Report.countDocuments(query),
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(parsedLimit)
        .populate('resumeId', 'fileName originalFileName versionNumber')
        .populate('analysisId', 'overallScore atsScore createdAt')
    ]);

    const list = reports.map((r) => ({
      reportId: r.reportId,
      resumeName: r.resumeId?.originalFileName || r.resumeId?.fileName || 'Resume',
      version: r.reportVersion,
      generatedAt: r.generatedAt || r.createdAt,
      downloadCount: r.downloadCount,
      status: r.status,
      atsScore: r.analysisId?.atsScore || 0,
      overallScore: r.analysisId?.overallScore || 0,
      analysisId: r.analysisId?._id
    }));

    return {
      reports: list,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit)
      }
    };
  }

  /**
   * Get a report details by reportId (verifying owner permissions)
   */
  async getReport(reportId, userId) {
    const report = await Report.findOne({ reportId, userId })
      .populate('resumeId')
      .populate('analysisId');

    if (!report) {
      throw new AppError('Report not found or access denied.', 404);
    }

    return report;
  }

  /**
   * Retrieve cached report or generate a new one
   */
  async getReportOrCreate(analysisId, userId) {
    const analysis = await Analysis.findOne({
      _id: analysisId,
      userId,
      isDeleted: false,
      status: 'completed'
    }).populate('resumeId');

    if (!analysis) {
      throw new AppError('Completed analysis not found.', 404);
    }

    // Check if valid cached report files exist
    const cached = await checkCachedReport(analysisId);
    if (cached) {
      return cached;
    }

    // Otherwise, generate a new report
    const reportId = uuidv4();
    const user = await User.findById(userId);
    const resume = analysis.resumeId;

    if (!resume) {
      throw new AppError('Associated resume not found.', 404);
    }

    // Initialize report record in Pending status
    const report = await Report.create({
      reportId,
      analysisId,
      resumeId: resume._id,
      userId,
      reportVersion: resume.versionNumber,
      status: 'Pending'
    });

    try {
      const [pdfPath, jsonPath] = await Promise.all([
        generatePDFReport({ reportId, user, resume, analysis }),
        generateJSONReport({ reportId, user, resume, analysis })
      ]);

      report.pdfPath = pdfPath;
      report.jsonPath = jsonPath;
      report.cached = true;
      report.status = 'Completed';
      await report.save();

      return report;
    } catch (err) {
      report.status = 'Failed';
      await report.save();
      throw new AppError(`Report generation failed: ${err.message}`, 500);
    }
  }

  /**
   * Record a download event and return file path
   */
  async downloadPDF(reportId, userId) {
    const report = await this.getReport(reportId, userId);

    if (report.status !== 'Completed' || !report.pdfPath || !fs.existsSync(report.pdfPath)) {
      throw new AppError('PDF report file not found on server.', 404);
    }

    // Increment download metrics
    report.downloadCount += 1;
    report.lastDownloaded = new Date();
    await report.save();

    return report.pdfPath;
  }

  /**
   * Record a download event and return file path
   */
  async downloadJSON(reportId, userId) {
    const report = await this.getReport(reportId, userId);

    if (report.status !== 'Completed' || !report.jsonPath || !fs.existsSync(report.jsonPath)) {
      throw new AppError('JSON report file not found on server.', 404);
    }

    // Increment download metrics
    report.downloadCount += 1;
    report.lastDownloaded = new Date();
    await report.save();

    return report.jsonPath;
  }

  /**
   * Force regeneration of a report
   */
  async regenerateReport(reportId, userId) {
    const report = await this.getReport(reportId, userId);

    const user = await User.findById(userId);
    const resume = await Resume.findById(report.resumeId);
    const analysis = await Analysis.findById(report.analysisId);

    if (!resume || !analysis) {
      throw new AppError('Associated analysis data is missing, cannot regenerate.', 404);
    }

    // Clean up old files on disk first
    await clearReportFiles(report);

    report.status = 'Pending';
    await report.save();

    try {
      const [pdfPath, jsonPath] = await Promise.all([
        generatePDFReport({ reportId: report.reportId, user, resume, analysis }),
        generateJSONReport({ reportId: report.reportId, user, resume, analysis })
      ]);

      report.pdfPath = pdfPath;
      report.jsonPath = jsonPath;
      report.cached = false; // Flag that it was forced regenerated
      report.status = 'Completed';
      await report.save();

      return report;
    } catch (err) {
      report.status = 'Failed';
      await report.save();
      throw new AppError(`Report regeneration failed: ${err.message}`, 500);
    }
  }

  /**
   * Delete report completely (DB record + files on disk)
   */
  async deleteReport(reportId, userId) {
    const report = await this.getReport(reportId, userId);

    // Clean up files on disk
    await clearReportFiles(report);

    // Remove DB record
    await Report.deleteOne({ _id: report._id });
  }
}

module.exports = new ReportService();
