'use strict';

/**
 * Analytics Service
 * Computes resume performance aggregates, trends, radar dimensions, and comparison deltas.
 *
 * Reference: Database.md, API.md, Testing-Strategy.md, PROJECT_RULES.md
 */

const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const User = require('../models/User');
const AppError = require('../utils/AppError');

class AnalyticsService {
  /**
   * Helper to build Mongoose filters based on query parameters
   *
   * @param {string} userId
   * @param {object} filters
   * @returns {object} Query filter
   * @private
   */
  _buildQuery(userId, filters = {}) {
    const query = {
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
      status: 'completed'
    };

    if (filters.resumeId) {
      query.resumeId = new mongoose.Types.ObjectId(filters.resumeId);
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    if (filters.minScore !== undefined || filters.maxScore !== undefined) {
      query.overallScore = {};
      if (filters.minScore !== undefined) {
        query.overallScore.$gte = Number(filters.minScore);
      }
      if (filters.maxScore !== undefined) {
        query.overallScore.$lte = Number(filters.maxScore);
      }
    }

    return query;
  }

  /**
   * Fetch consolidated summary stats
   */
  async getAnalyticsSummary(userId, filters = {}) {
    const query = this._buildQuery(userId, filters);

    const [summaryAggregate, totalResumes, latestAnalysis] = await Promise.all([
      Analysis.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            avgAts: { $avg: '$atsScore' },
            avgGrammar: { $avg: '$grammarScore' },
            avgFormatting: { $avg: '$formattingScore' },
            avgSkills: { $avg: '$skillsScore' },
            avgProjects: { $avg: '$projectsScore' },
            avgEducation: { $avg: '$educationScore' },
            avgExperience: { $avg: '$experienceScore' },
            avgSummary: { $avg: '$summaryScore' },
            avgOverall: { $avg: '$overallScore' },
            totalAnalyses: { $sum: 1 }
          }
        }
      ]),
      Resume.countDocuments({ userId, isDeleted: false }),
      Analysis.findOne(query).sort({ createdAt: -1 })
    ]);

    if (!summaryAggregate || summaryAggregate.length === 0) {
      return {
        avgAtsScore: 0,
        avgGrammarScore: 0,
        avgFormattingScore: 0,
        avgSkillsScore: 0,
        avgProjectsScore: 0,
        avgEducationScore: 0,
        avgExperienceScore: 0,
        avgSummaryScore: 0,
        avgOverallScore: 0,
        totalAnalyses: 0,
        totalResumes,
        overallHealth: 'N/A'
      };
    }

    const sa = summaryAggregate[0];
    let overallHealth = 'N/A';
    if (latestAnalysis) {
      const score = latestAnalysis.overallScore;
      if (score >= 75) overallHealth = 'Excellent';
      else if (score >= 50) overallHealth = 'Good';
      else overallHealth = 'Needs Improvement';
    }

    return {
      avgAtsScore: Math.round(sa.avgAts),
      avgGrammarScore: Math.round(sa.avgGrammar),
      avgFormattingScore: Math.round(sa.avgFormatting),
      avgSkillsScore: Math.round(sa.avgSkills),
      avgProjectsScore: Math.round(sa.avgProjects),
      avgEducationScore: Math.round(sa.avgEducation),
      avgExperienceScore: Math.round(sa.avgExperience),
      avgSummaryScore: Math.round(sa.avgSummary),
      avgOverallScore: Math.round(sa.avgOverall),
      totalAnalyses: sa.totalAnalyses,
      totalResumes,
      overallHealth
    };
  }

  /**
   * Fetch paginated history list
   */
  async getAnalyticsHistory(userId, filters = {}, page = 1, limit = 10) {
    const query = this._buildQuery(userId, filters);
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const offset = (parsedPage - 1) * parsedLimit;

    const [total, analyses] = await Promise.all([
      Analysis.countDocuments(query),
      Analysis.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(parsedLimit)
        .populate('resumeId', 'fileName versionNumber')
    ]);

    const list = analyses.map(item => ({
      analysisId: item._id,
      resumeId: item.resumeId?._id || null,
      fileName: item.resumeId?.fileName || 'Resume',
      versionNumber: item.resumeId?.versionNumber || 1,
      atsScore: item.atsScore,
      overallScore: item.overallScore,
      aiModel: item.aiModel,
      analysisDuration: item.analysisDuration,
      analysisDate: item.analysisTimestamp || item.createdAt
    }));

    return {
      analyses: list,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit)
      }
    };
  }

  /**
   * Fetch score trends across versions
   */
  async getAnalyticsTrends(userId, filters = {}) {
    const query = this._buildQuery(userId, filters);

    const analyses = await Analysis.find(query)
      .sort({ createdAt: 1 })
      .populate('resumeId', 'fileName versionNumber');

    return analyses.map(item => ({
      analysisId: item._id,
      versionNumber: item.resumeId?.versionNumber || 1,
      fileName: item.resumeId?.fileName || 'Resume',
      atsScore: item.atsScore,
      grammarScore: item.grammarScore,
      formattingScore: item.formattingScore,
      skillsScore: item.skillsScore,
      projectsScore: item.projectsScore,
      experienceScore: item.experienceScore,
      educationScore: item.educationScore,
      overallScore: item.overallScore,
      date: item.analysisTimestamp || item.createdAt
    }));
  }

  /**
   * Compare a specific resume analysis version with the previous version
   */
  async getAnalyticsComparison(userId, resumeId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const resumeObjectId = new mongoose.Types.ObjectId(resumeId);

    // 1. Fetch current analysis
    const currentAnalysis = await Analysis.findOne({
      resumeId: resumeObjectId,
      userId: userObjectId,
      isDeleted: false,
      status: 'completed'
    }).populate('resumeId');

    if (!currentAnalysis) {
      throw new AppError('Completed analysis not found for the specified resume.', 404);
    }

    const currentResume = currentAnalysis.resumeId;

    // 2. Fetch previous analysis
    let prevAnalysis = null;
    if (currentResume && currentResume.versionNumber > 1) {
      const prevResume = await Resume.findOne({
        userId: userObjectId,
        fileName: currentResume.fileName,
        versionNumber: currentResume.versionNumber - 1,
        isDeleted: false
      });
      if (prevResume) {
        prevAnalysis = await Analysis.findOne({
          resumeId: prevResume._id,
          userId: userObjectId,
          isDeleted: false,
          status: 'completed'
        });
      }
    }

    // Fallback if no matching preceding version but user has other resumes
    if (!prevAnalysis) {
      prevAnalysis = await Analysis.findOne({
        userId: userObjectId,
        resumeId: { $ne: resumeObjectId },
        isDeleted: false,
        status: 'completed'
      })
        .sort({ createdAt: -1 })
        .populate('resumeId');
    }

    // 3. Compile comparison response
    const current = {
      analysisId: currentAnalysis._id,
      resumeId: currentResume?._id,
      versionNumber: currentResume?.versionNumber || 1,
      fileName: currentResume?.fileName || 'Current Resume',
      atsScore: currentAnalysis.atsScore,
      grammarScore: currentAnalysis.grammarScore,
      formattingScore: currentAnalysis.formattingScore,
      skillsScore: currentAnalysis.skillsScore,
      projectsScore: currentAnalysis.projectsScore,
      experienceScore: currentAnalysis.experienceScore,
      educationScore: currentAnalysis.educationScore,
      overallScore: currentAnalysis.overallScore,
      strengths: currentAnalysis.strengths,
      weaknesses: currentAnalysis.weaknesses,
      suggestions: currentAnalysis.suggestions
    };

    const previous = prevAnalysis ? {
      analysisId: prevAnalysis._id,
      resumeId: prevAnalysis.resumeId?._id || prevAnalysis.resumeId,
      versionNumber: prevAnalysis.resumeId?.versionNumber || 1,
      fileName: prevAnalysis.resumeId?.fileName || 'Previous Resume',
      atsScore: prevAnalysis.atsScore,
      grammarScore: prevAnalysis.grammarScore,
      formattingScore: prevAnalysis.formattingScore,
      skillsScore: prevAnalysis.skillsScore,
      projectsScore: prevAnalysis.projectsScore,
      experienceScore: prevAnalysis.experienceScore,
      educationScore: prevAnalysis.educationScore,
      overallScore: prevAnalysis.overallScore,
      strengths: prevAnalysis.strengths,
      weaknesses: prevAnalysis.weaknesses,
      suggestions: prevAnalysis.suggestions
    } : null;

    // Delta changes
    const deltas = {
      atsScore: current.atsScore - (previous ? previous.atsScore : 0),
      grammarScore: current.grammarScore - (previous ? previous.grammarScore : 0),
      formattingScore: current.formattingScore - (previous ? previous.formattingScore : 0),
      skillsScore: current.skillsScore - (previous ? previous.skillsScore : 0),
      projectsScore: current.projectsScore - (previous ? previous.projectsScore : 0),
      experienceScore: current.experienceScore - (previous ? previous.experienceScore : 0),
      educationScore: current.educationScore - (previous ? previous.educationScore : 0),
      overallScore: current.overallScore - (previous ? previous.overallScore : 0)
    };

    const improvements = [];
    if (previous) {
      if (deltas.overallScore > 0) {
        improvements.push(`Overall score increased by ${deltas.overallScore} points.`);
      }
      if (deltas.atsScore > 0) {
        improvements.push(`ATS compatibility improved by ${deltas.atsScore} points.`);
      }
      if (deltas.skillsScore > 0) {
        improvements.push(`Skills alignment score increased by ${deltas.skillsScore} points.`);
      }
      if (current.strengths.length > previous.strengths.length) {
        improvements.push('Identified additional strengths in the updated version.');
      }
      if (current.weaknesses.length < previous.weaknesses.length) {
        improvements.push('Successfully resolved previous resume weaknesses.');
      }
    } else {
      improvements.push('First analysis version compiled. No baseline comparisons available.');
    }

    return {
      current,
      previous,
      deltas,
      improvements
    };
  }

  /**
   * Fetch skills radar parameters and keyword distributions
   */
  async getSkillsAnalytics(userId, resumeId = null) {
    const query = {
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
      status: 'completed'
    };

    if (resumeId) {
      query.resumeId = new mongoose.Types.ObjectId(resumeId);
    }

    const latestAnalysis = await Analysis.findOne(query)
      .sort({ createdAt: -1 })
      .populate('resumeId');

    if (!latestAnalysis) {
      return {
        resumeId: null,
        fileName: null,
        versionNumber: null,
        detectedSkills: [],
        missingSkills: [],
        recommendedKeywords: [],
        radarChartData: [
          { name: 'Technical Skills', value: 0 },
          { name: 'Soft Skills', value: 0 },
          { name: 'Communication', value: 0 },
          { name: 'Leadership', value: 0 },
          { name: 'Problem Solving', value: 0 }
        ]
      };
    }

    // Derive 5-dimension radar values dynamically based on available analysis variables
    const skillsScore = latestAnalysis.skillsScore;
    const grammarScore = latestAnalysis.grammarScore;
    const experienceScore = latestAnalysis.experienceScore;
    const projectsScore = latestAnalysis.projectsScore;

    // Soft skills count check: default baseline based on skills count
    const skillsLength = latestAnalysis.detectedSkills ? latestAnalysis.detectedSkills.length : 0;
    const softSkillsScore = Math.min(100, Math.max(30, skillsLength * 5 + 35));

    const radarChartData = [
      { name: 'Technical Skills', value: skillsScore },
      { name: 'Soft Skills', value: softSkillsScore },
      { name: 'Communication', value: grammarScore },
      { name: 'Leadership', value: experienceScore },
      { name: 'Problem Solving', value: projectsScore }
    ];

    return {
      resumeId: latestAnalysis.resumeId?._id || latestAnalysis.resumeId,
      fileName: latestAnalysis.resumeId?.fileName || 'Resume',
      versionNumber: latestAnalysis.resumeId?.versionNumber || 1,
      detectedSkills: latestAnalysis.detectedSkills || [],
      missingSkills: latestAnalysis.missingSkills || [],
      recommendedKeywords: latestAnalysis.recommendedKeywords || [],
      radarChartData
    };
  }
}

module.exports = new AnalyticsService();
