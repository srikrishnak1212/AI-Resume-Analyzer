import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, FileText, Calendar, Zap, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import AppLayout from '../../components/common/AppLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import ScoreGauge from '../../components/charts/ScoreGauge';
import AnalysisCharts from '../../components/charts/AnalysisCharts';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import AIThinkingIndicator from '../../components/common/AIThinkingIndicator';

import ATSScoreCard from '../../components/dashboard/ATSScoreCard';
import StrengthCard from '../../components/dashboard/StrengthCard';
import WeaknessCard from '../../components/dashboard/WeaknessCard';
import SuggestionCard from '../../components/dashboard/SuggestionCard';
import SkillsCard from '../../components/dashboard/SkillsCard';
import KeywordCard from '../../components/dashboard/KeywordCard';

import { getAnalysis, triggerAnalysis } from '../../services/analysisService';
import { getResume } from '../../services/resumeService';
import { generateReport } from '../../services/reportService';
import { ROUTES } from '../../utils/constants';

/**
 * ResumeAnalysisPage — Displays full structured AI feedback for a resume version.
 * Implements non-blocking background polling and caching details.
 *
 * Reference: UI-Guide.md §7.7, SRS §16, §18
 */
const ResumeAnalysisPage = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const pollTimerRef = useRef(null);

  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  // Fetch resume details and analysis job
  const fetchResumeAndAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Load resume meta
      const resumeData = await getResume(resumeId);
      setResume(resumeData.resume);

      // 2. Fetch current analysis
      try {
        const analysisData = await getAnalysis(resumeId);
        setAnalysis(analysisData.analysis);

        const status = analysisData.analysis.status;
        if (status === 'pending' || status === 'processing') {
          setAnalyzing(true);
          startPolling();
        } else {
          setAnalyzing(false);
        }
      } catch (err) {
        // If analysis is 404, trigger a new one automatically
        if (err.response?.status === 404) {
          logger.info('[ResumeAnalysisPage] No analysis found. Triggering first-run analysis.');
          await runNewAnalysis();
        } else {
          throw err;
        }
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load analysis details.');
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    fetchResumeAndAnalysis();
  }, [fetchResumeAndAnalysis]);

  // Start polling analysis status
  const startPolling = () => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);

    pollTimerRef.current = setTimeout(async function poll() {
      try {
        const data = await getAnalysis(resumeId);
        const latestJob = data.analysis;
        setAnalysis(latestJob);

        if (latestJob.status === 'completed') {
          setAnalyzing(false);
          toast.success('AI Resume Analysis completed!');
          // Refresh resume details to get updated analysisStatus
          const resumeData = await getResume(resumeId);
          setResume(resumeData.resume);
        } else if (latestJob.status === 'failed') {
          setAnalyzing(false);
          setError(latestJob.errorMessage || 'AI Analysis run failed.');
        } else {
          // Still processing, poll again in 1.5s
          pollTimerRef.current = setTimeout(poll, 1500);
        }
      } catch (err) {
        setAnalyzing(false);
        setError('Connection lost during analysis polling.');
      }
    }, 1500);
  };

  // Launch analysis
  const runNewAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      const data = await triggerAnalysis(resumeId);
      setAnalysis(data.analysis);
      startPolling();
    } catch (err) {
      setAnalyzing(false);
      setError(err.response?.data?.error?.message || 'Could not initiate AI Analysis.');
    }
  };

  const handleReanalyze = async () => {
    if (analyzing) return;
    try {
      setLoading(true);
      await runNewAnalysis();
    } catch (err) {
      setError('Re-analysis initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async () => {
    try {
      setLoading(true);
      const r = await generateReport(analysis.analysisId || analysis._id);
      navigate(`/reports/${r.reportId}`);
    } catch (err) {
      toast.error('Failed to prepare report.');
    } finally {
      setLoading(false);
    }
  };

  // Score progression color mapping
  const getProgressColor = (score) => {
    if (score <= 49) return 'bg-danger';
    if (score <= 74) return 'bg-warning';
    return 'bg-success';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <LoadingSkeleton type="analysis" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-alt transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Resume AI Analytics
              </h1>
              {resume && (
                <p className="text-sm text-text-secondary mt-0.5">
                  {resume.fileName} (Version {resume.versionNumber}
                  {resume.versionLabel ? ` — ${resume.versionLabel}` : ''})
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!analyzing && !error && analysis && analysis.status === 'completed' && (
              <Button
                variant="primary"
                onClick={handleViewReport}
                className="flex items-center gap-2 shrink-0 font-bold"
              >
                View AI Report
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleReanalyze}
              disabled={analyzing}
              className="flex items-center gap-2 shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${analyzing ? 'animate-spin' : ''}`} />
              Re-analyze
            </Button>
            <Link to={ROUTES.HISTORY}>
              <Button variant="ghost">View Versions</Button>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert
              variant="danger"
              title="Analysis Error"
              message={error}
              onClose={() => setError(null)}
            />
            <div className="mt-4 flex justify-center">
              <Button onClick={fetchResumeAndAnalysis}>Retry Process</Button>
            </div>
          </div>
        )}

        {/* Active Processing State */}
        {analyzing && !error && (
          <div className="py-12">
            <AIThinkingIndicator />
          </div>
        )}

        {/* Completed State */}
        {!analyzing && !error && analysis && analysis.status === 'completed' && (
          <div className="space-y-6">
            {/* Hero Row: Overall Score & Summary Card */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Overall Score Circle Gauge */}
              <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface p-6 shadow-sm">
                <ScoreGauge score={analysis.overallScore} size={150} strokeWidth={10} label="Overall Score" />
                {analysis.cached && (
                  <div className="mt-4 flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    Served from Cache
                  </div>
                )}
              </div>

              {/* Textual Narrative Summary */}
              <div className="rounded-lg border border-border bg-surface p-6 shadow-sm md:col-span-2 flex flex-col justify-between">
                <div>
                  <h3 className="mb-3 text-lg font-bold text-text-primary">Executive Summary</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {analysis.analysisSummary || analysis.professionalSummary}
                  </p>
                </div>
                
                {/* Micro scoring metrics */}
                <div className="mt-6 border-t border-border pt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted">ATS Score</span>
                    <span className={`text-xl font-bold ${analysis.atsScore >= 75 ? 'text-success' : analysis.atsScore >= 50 ? 'text-warning' : 'text-danger'}`}>
                      {analysis.atsScore}/100
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted">Grammar</span>
                    <span className={`text-xl font-bold ${analysis.grammarScore >= 75 ? 'text-success' : 'text-grammarScore'}`}>
                      {analysis.grammarScore}/100
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted">Formatting</span>
                    <span className={`text-xl font-bold ${analysis.formattingScore >= 75 ? 'text-success' : 'text-formattingScore'}`}>
                      {analysis.formattingScore}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recharts Breakdown Charts */}
            <AnalysisCharts analysis={analysis} />

            {/* Strengths & Weaknesses (Critique Details) */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <StrengthCard strengths={analysis.strengths} />
              <WeaknessCard weaknesses={analysis.weaknesses} />
            </div>

            {/* Quick Wins Suggestions */}
            <SuggestionCard suggestions={analysis.suggestions} />

            {/* Keyword Analysis */}
            <KeywordCard atsAnalysis={{ keywordsFound: analysis.detectedSkills, keywordsMissing: analysis.recommendedKeywords }} />

            {/* Skills Audit */}
            <SkillsCard detectedSkills={analysis.detectedSkills} missingSkills={analysis.missingSkills} />

            {/* ATS Parseability Checks */}
            {analysis.atsAnalysis && <ATSScoreCard atsAnalysis={analysis.atsAnalysis} />}

            {/* Metadata Footer */}
            <div className="rounded-lg border border-border bg-surface p-4 text-xs text-text-muted flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-xs">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>Model: <strong className="text-text-secondary">{analysis.aiModel}</strong></span>
                <span>Prompt Version: <strong className="text-text-secondary">{analysis.promptVersion}</strong></span>
                <span>Latency: <strong className="text-text-secondary">{(analysis.analysisDuration / 1000).toFixed(2)}s</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Analyzed on {new Date(analysis.analysisTimestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Failed Analysis Placeholder */}
        {!analyzing && !error && analysis && analysis.status === 'failed' && (
          <div className="text-center py-12 rounded-xl border border-border bg-surface shadow-sm max-w-lg mx-auto">
            <AlertTriangle className="h-12 w-12 text-danger mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-text-primary mb-2">Analysis Session Failed</h3>
            <p className="text-sm text-text-secondary mb-6 px-6">
              {analysis.errorMessage || 'An error occurred during AI processing. Please retry again.'}
            </p>
            <Button onClick={handleReanalyze}>Re-trigger AI Analysis</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

// Simple Logger Fallback
const logger = {
  info: (msg) => console.log(msg),
  error: (msg) => console.error(msg),
};

export default ResumeAnalysisPage;
