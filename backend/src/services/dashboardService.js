'use strict';

/**
 * Dashboard Service
 * Business logic for aggregating user statistics, computing metrics,
 * and compiling combined recent activities feed.
 *
 * Reference: Database.md, API.md, SRS FR-15, PROJECT_RULES.md
 */

const User = require('../models/User');
const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const AppError = require('../utils/AppError');

class DashboardService {
  /**
   * Compiles the dashboard overview metrics and statistics for a user
   *
   * @param {string} userId - ID of the authenticated user
   * @returns {Promise<object>} Dashboard payload
   */
  async getUserDashboardStats(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    // 1. Core aggregations and queries in parallel
    const [
      totalResumes,
      totalAnalyses,
      latestResume,
      latestAnalysis,
      statsAggregate
    ] = await Promise.all([
      Resume.countDocuments({ userId, isDeleted: false }),
      Analysis.countDocuments({ userId, isDeleted: false, status: 'completed' }),
      Resume.findOne({ userId, isDeleted: false }).sort({ createdAt: -1 }),
      Analysis.findOne({ userId, isDeleted: false, status: 'completed' })
        .sort({ createdAt: -1 })
        .populate('resumeId'),
      Analysis.aggregate([
        { $match: { userId: user._id, isDeleted: false, status: 'completed' } },
        {
          $group: {
            _id: null,
            avgAts: { $avg: '$atsScore' },
            avgOverall: { $avg: '$overallScore' }
          }
        }
      ])
    ]);

    // 2. Compute stats averages
    const averageAtsScore = statsAggregate.length > 0 ? Math.round(statsAggregate[0].avgAts) : 0;
    const averageOverallScore = statsAggregate.length > 0 ? Math.round(statsAggregate[0].avgOverall) : 0;

    // 3. Compile parsing success rates
    const parsedStats = await Promise.all([
      Resume.countDocuments({ userId, isDeleted: false, parsingStatus: 'Completed' }),
      Resume.countDocuments({ userId, isDeleted: false, parsingStatus: 'Failed' })
    ]);
    const completedParses = parsedStats[0];
    const failedParses = parsedStats[1];
    const parsingSuccessRate = completedParses + failedParses > 0
      ? Math.round((completedParses / (completedParses + failedParses)) * 100)
      : 100;

    // 4. Compile recent uploads and recent analyses lists
    const [recentUploadsRaw, recentAnalysesRaw] = await Promise.all([
      Resume.find({ userId, isDeleted: false }).sort({ createdAt: -1 }).limit(5),
      Analysis.find({ userId, isDeleted: false, status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('resumeId')
    ]);

    // 5. Build combined recent activities
    const activities = [];

    // Map uploads
    recentUploadsRaw.forEach((resume) => {
      activities.push({
        id: `upload-${resume._id}`,
        type: 'upload',
        title: 'Resume Uploaded',
        description: `Uploaded version ${resume.versionNumber} of "${resume.fileName}"`,
        timestamp: resume.createdAt
      });
    });

    // Map analyses
    recentAnalysesRaw.forEach((analysis) => {
      const fileName = analysis.resumeId ? analysis.resumeId.fileName : 'Resume';
      activities.push({
        id: `analysis-${analysis._id}`,
        type: 'analysis',
        title: 'Analysis Completed',
        description: `AI Analysis completed for "${fileName}" with score ${analysis.overallScore}`,
        timestamp: analysis.analysisTimestamp || analysis.createdAt
      });
    });

    // Map login
    if (user.lastLoginAt) {
      activities.push({
        id: `login-${user._id}-${user.lastLoginAt.getTime()}`,
        type: 'login',
        title: 'Logged In',
        description: 'Session authenticated successfully',
        timestamp: user.lastLoginAt
      });
    }

    // Sort by timestamp descending and limit to 10
    const recentActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    return {
      userProfile: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        planTier: user.planTier || 'Free',
        avatarUrl: user.avatarUrl || null,
        createdAt: user.createdAt
      },
      metrics: {
        totalResumes,
        totalAnalyses,
        latestResume: latestResume ? {
          resumeId: latestResume._id,
          fileName: latestResume.fileName,
          versionNumber: latestResume.versionNumber,
          versionLabel: latestResume.versionLabel,
          createdAt: latestResume.createdAt,
          parsingStatus: latestResume.parsingStatus
        } : null,
        latestAtsScore: latestAnalysis ? latestAnalysis.atsScore : null,
        latestOverallScore: latestAnalysis ? latestAnalysis.overallScore : null,
        lastAnalysisDate: latestAnalysis ? (latestAnalysis.analysisTimestamp || latestAnalysis.createdAt) : null,
        accountAgeDays: Math.max(0, Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)))
      },
      quickStatistics: {
        averageAtsScore,
        averageOverallScore,
        parsingSuccessRate,
        resumeVersionsCount: totalResumes
      },
      recentActivities
    };
  }

  /**
   * Retrieves individual recent uploads and completed analyses lists
   *
   * @param {string} userId - User ID
   * @param {number} limit - Maximum count of items to return
   * @returns {Promise<object>} Recent datasets
   */
  async getRecentActivities(userId, limit = 5) {
    const parsedLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 5));

    const [recentUploads, recentAnalyses] = await Promise.all([
      Resume.find({ userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(parsedLimit)
        .select('fileName fileType fileSize versionNumber parsingStatus analysisStatus createdAt'),
      Analysis.find({ userId, isDeleted: false, status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(parsedLimit)
        .populate('resumeId', 'fileName')
        .select('atsScore overallScore analysisTimestamp createdAt')
    ]);

    // Build standard activities summary array
    const activities = [];

    recentUploads.forEach((resume) => {
      activities.push({
        id: `upload-${resume._id}`,
        type: 'upload',
        title: 'Resume Uploaded',
        description: `Uploaded version ${resume.versionNumber} of "${resume.fileName}"`,
        timestamp: resume.createdAt
      });
    });

    recentAnalyses.forEach((analysis) => {
      const fileName = analysis.resumeId ? analysis.resumeId.fileName : 'Resume';
      activities.push({
        id: `analysis-${analysis._id}`,
        type: 'analysis',
        title: 'Analysis Completed',
        description: `AI Analysis completed for "${fileName}" with score ${analysis.overallScore}`,
        timestamp: analysis.analysisTimestamp || analysis.createdAt
      });
    });

    const recentActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parsedLimit);

    return {
      recentUploads,
      recentAnalyses,
      recentActivities
    };
  }
}

module.exports = new DashboardService();
