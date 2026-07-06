'use strict';

/**
 * JSON Export Service
 * Compiles a structured JSON document representing the full analysis payload.
 *
 * Reference: API.md, Phase 6C Spec
 */

const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
const REPORTS_DIR = path.resolve(UPLOADS_DIR, 'reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Generate JSON Export File
 *
 * @param {object} params
 * @param {string} params.reportId - Generated report ID
 * @param {object} params.user - User model instance
 * @param {object} params.resume - Resume model instance
 * @param {object} params.analysis - Analysis model instance
 * @returns {Promise<string>} File path to the generated JSON file
 */
const generateJSONReport = async ({ reportId, user, resume, analysis }) => {
  const fileName = `${reportId}.json`;
  const outputPath = path.join(REPORTS_DIR, fileName);

  const payload = {
    reportMetadata: {
      reportId,
      reportType: 'JSON',
      version: resume.versionNumber,
      generatedAt: new Date(),
      aiModel: analysis.aiModel,
      promptVersion: '1.0',
      analysisVersion: '1.0'
    },
    userProfile: {
      fullName: user.fullName,
      email: user.email,
      planTier: user.planTier
    },
    resumeDetails: {
      fileName: resume.fileName,
      originalFileName: resume.originalFileName,
      fileSize: resume.fileSize,
      fileType: resume.fileType,
      uploadedAt: resume.createdAt
    },
    evaluationMetrics: {
      overallScore: analysis.overallScore,
      atsScore: analysis.atsScore,
      healthDescriptor: analysis.overallScore >= 75 ? 'Excellent' : analysis.overallScore >= 50 ? 'Good' : 'Needs Work'
    },
    scoresBreakdown: {
      grammarScore: analysis.grammarScore,
      formattingScore: analysis.formattingScore,
      skillsScore: analysis.skillsScore,
      projectsScore: analysis.projectsScore,
      experienceScore: analysis.experienceScore,
      educationScore: analysis.educationScore,
      summaryScore: analysis.summaryScore
    },
    aiInsights: {
      summary: analysis.summary,
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      suggestions: analysis.suggestions || []
    },
    keywords: {
      detectedKeywords: analysis.detectedSkills || [],
      missingKeywords: analysis.missingSkills || [],
      recommendedKeywords: analysis.recommendedKeywords || []
    }
  };

  await fs.promises.writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf-8');
  return outputPath;
};

module.exports = {
  generateJSONReport,
};
