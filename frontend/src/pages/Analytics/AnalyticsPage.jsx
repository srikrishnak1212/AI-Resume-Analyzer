import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardSkeleton from '../../components/dashboard/LoadingSkeleton';
import AnalyticsFilters from '../../components/analytics/AnalyticsFilters';
import TrendCard from '../../components/analytics/TrendCard';
import ATSGauge from '../../components/analytics/ATSGauge';
import RadarChart from '../../components/analytics/RadarChart';
import ScoreBarChart from '../../components/analytics/ScoreBarChart';
import TimelineChart from '../../components/analytics/TimelineChart';
import KeywordChart from '../../components/analytics/KeywordChart';
import ResumeComparison from '../../components/analytics/ResumeComparison';
import HistoryTable from '../../components/analytics/HistoryTable';
import SectionTitle from '../../components/dashboard/SectionTitle';
import {
  getAnalyticsSummary,
  getAnalyticsHistory,
  getAnalyticsTrends,
  getAnalyticsComparison,
  getSkillsAnalytics
} from '../../services/analyticsService';
import { listResumes } from '../../services/resumeService';
import toast from 'react-hot-toast';

/**
 * AnalyticsPage — View displaying performance summaries, comparisons, and keyword checklists.
 *
 * Reference: UI-Guide.md §7.5, Implementation-Guide.md Phase 6B
 * Rule: Functional Component + Hooks only (PROJECT_RULES.md)
 */
const AnalyticsPage = () => {
  const navigate = useNavigate();

  // Core data states
  const [resumes, setResumes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [skills, setSkills] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({});

  // Loading states
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isFilterFetching, setIsFilterFetching] = useState(false);
  const [isHistoryFetching, setIsHistoryFetching] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    resumeId: '',
    minScore: undefined,
    maxScore: undefined,
    startDate: '',
    endDate: ''
  });
  const [historyPage, setHistoryPage] = useState(1);

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsPageLoading(true);
        // Load user's resumes for dropdown filtering (capped at 50 to match backend validator limits)
        const result = await listResumes({ page: 1, limit: 50 });
        setResumes(result.resumes || []);
      } catch (err) {
        // Fallback silently if the endpoint fails
        setResumes([]);
      } finally {
        setIsPageLoading(false);
      }
    };
    initialize();
  }, []);

  // Fetch all analytics datasets when filters or page changes
  const fetchAnalytics = async () => {
    try {
      setIsFilterFetching(true);
      
      // Determine active target resume ID for comparison/radar
      // If none selected, default to the latest resume in list (resumes[0])
      const activeResumeId = filters.resumeId || (resumes.length > 0 ? resumes[0]._id : null);

      const [summaryRes, trendsRes, skillsRes] = await Promise.all([
        getAnalyticsSummary(filters),
        getAnalyticsTrends(filters),
        activeResumeId ? getSkillsAnalytics(activeResumeId) : Promise.resolve(null)
      ]);

      setSummary(summaryRes);
      setTrends(trendsRes || []);
      setSkills(skillsRes);

      // Fetch comparison deltas (wrapped in separate catch to handle missing previous baseline versions)
      if (activeResumeId) {
        try {
          const compRes = await getAnalyticsComparison(activeResumeId);
          setComparison(compRes);
        } catch {
          setComparison(null);
        }
      } else {
        setComparison(null);
      }

    } catch (err) {
      toast.error('Failed to update analytics datasets.');
    } finally {
      setIsFilterFetching(false);
    }
  };

  // Fetch history separately (enabling fast paginated loading)
  const fetchHistory = async () => {
    try {
      setIsHistoryFetching(true);
      const histRes = await getAnalyticsHistory(filters, historyPage, 10);
      setHistory(histRes.analyses || []);
      setPagination(histRes.pagination || {});
    } catch {
      toast.error('Failed to update history log.');
    } finally {
      setIsHistoryFetching(false);
    }
  };

  useEffect(() => {
    if (!isPageLoading) {
      fetchAnalytics();
    }
  }, [filters, resumes, isPageLoading]);

  useEffect(() => {
    if (!isPageLoading) {
      fetchHistory();
    }
  }, [filters, historyPage, isPageLoading]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setHistoryPage(1); // Reset page on filter changes
  };

  const handleResetFilters = () => {
    setFilters({
      resumeId: '',
      minScore: undefined,
      maxScore: undefined,
      startDate: '',
      endDate: ''
    });
    setHistoryPage(1);
  };

  const handleViewDetail = (resumeId) => {
    if (resumeId) {
      navigate(`/analysis/${resumeId}`);
    }
  };

  if (isPageLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader title="AI Analytics" description="Initializing data visualization boards..." />
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  const hasAnalyses = summary?.totalAnalyses > 0;

  // Compute stats trends
  const initialScore = trends.length > 0 ? trends[0].overallScore : 0;
  const latestScore = trends.length > 0 ? trends[trends.length - 1].overallScore : 0;
  const improvementDelta = latestScore - initialScore;

  const highestScoreObj = trends.length > 0
    ? [...trends].sort((a, b) => b.overallScore - a.overallScore)[0]
    : null;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <DashboardHeader
        title="AI Analytics"
        description="Detailed insights, score progressions, and version comparative deltas."
      />

      <div className="space-y-6">
        {/* Interactive Filters Panel */}
        <AnalyticsFilters
          resumes={resumes}
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {!hasAnalyses ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center shadow-xs">
            <h3 className="text-lg font-black text-text-primary">No completed analyses found</h3>
            <p className="text-body-sm text-text-muted mt-2 max-w-sm mx-auto">
              Please upload and run AI analysis on your resume to populate the performance dashboards.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Highlighted Trend Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <TrendCard
                type="best"
                subtitle="Best Score"
                value={highestScoreObj ? `${highestScoreObj.overallScore}/100` : 'N/A'}
                description={highestScoreObj ? `Achieved on version ${highestScoreObj.versionNumber}` : 'No analyses run'}
              />
              <TrendCard
                type="improvement"
                subtitle="Overall Progress"
                value={improvementDelta > 0 ? `+${improvementDelta} pts` : `${improvementDelta} pts`}
                description={`Compared to version 1 baseline`}
              />
              <TrendCard
                type="insights"
                subtitle="Resume Health"
                value={summary.overallHealth}
                description="Status based on latest upload"
              />
              <TrendCard
                type="duration"
                subtitle="Avg API Latency"
                value={`${((trends.reduce((sum, item) => sum + item.overallScore, 0) / (trends.length || 1)) || 0).toFixed(0)}/100`}
                description="Composite average score"
              />
            </div>

            {/* Core Score Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* ATS Speedometer Dial */}
              <ATSGauge score={summary.avgAtsScore} isLoading={isFilterFetching} />

              {/* 5-Dimension Polar Radar */}
              <RadarChart data={skills?.radarChartData} isLoading={isFilterFetching} />
            </div>

            {/* Overall Dimensions Bar Chart */}
            <ScoreBarChart summaryData={summary} isLoading={isFilterFetching} />

            {/* Progression Timeline Chart */}
            <TimelineChart trends={trends} isLoading={isFilterFetching} />

            {/* Keyword Distributions */}
            <KeywordChart
              detectedKeywords={skills?.detectedKeywords}
              missingKeywords={skills?.missingSkills}
              recommendedKeywords={skills?.recommendedKeywords}
              isLoading={isFilterFetching}
            />

            {/* Side-by-side versions comparison */}
            <ResumeComparison comparisonData={comparison} isLoading={isFilterFetching} />

            {/* Paginated runs history table */}
            <HistoryTable
              analyses={history}
              pagination={pagination}
              onPageChange={setHistoryPage}
              onViewClick={handleViewDetail}
              isLoading={isHistoryFetching}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
