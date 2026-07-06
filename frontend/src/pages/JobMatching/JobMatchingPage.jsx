import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { listResumes } from '../../services/resumeService';
import { createJobMatch, listJobMatches, deleteJobMatch, getJobMatchDetails } from '../../services/jobMatchService';
import toast from 'react-hot-toast';

// Reusable Components
import JobDescriptionEditor from '../../components/jobMatch/JobDescriptionEditor';
import JobDescriptionUpload from '../../components/jobMatch/JobDescriptionUpload';
import MatchLoadingAnimation from '../../components/jobMatch/MatchLoadingAnimation';
import CompatibilityGauge from '../../components/jobMatch/CompatibilityGauge';
import MatchScoreCard from '../../components/jobMatch/MatchScoreCard';
import SkillsComparison from '../../components/jobMatch/SkillsComparison';
import KeywordComparison from '../../components/jobMatch/KeywordComparison';
import PriorityActionCard from '../../components/jobMatch/PriorityActionCard';
import RecommendationPanel from '../../components/jobMatch/RecommendationPanel';
import ComparisonTable from '../../components/jobMatch/ComparisonTable';

import { Target, FileText, ArrowLeft, Trash2, Calendar, ClipboardCopy, RefreshCw } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

/**
 * JobMatchingPage — Main orchestration page for AI Job Description Matching.
 */
const JobMatchingPage = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [activeInputTab, setActiveInputTab] = useState('paste'); // 'paste' | 'upload'
  const [jobDescription, setJobDescription] = useState(null);

  const [loading, setLoading] = useState(false);
  const [matchingInProgress, setMatchingInProgress] = useState(false);
  
  const [matchResult, setMatchResult] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load user resumes and matches history
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [resumesData, historyData] = await Promise.all([
        listResumes({ page: 1, limit: 50 }),
        listJobMatches({ page: 1, limit: 10 }),
      ]);

      const completed = (resumesData.resumes || []).filter(r => r.parsingStatus === 'Completed');
      setResumes(completed);
      if (completed.length > 0) {
        setSelectedResumeId(completed[0]._id);
      }

      setMatchHistory(historyData.matches || []);
      setTotalPages(historyData.pagination?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load initial matching data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadHistory = async (page) => {
    try {
      const historyData = await listJobMatches({ page, limit: 10 });
      setMatchHistory(historyData.matches || []);
      setHistoryPage(page);
      setTotalPages(historyData.pagination?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to reload history.');
    }
  };

  const handleJDParsed = (jd) => {
    setJobDescription(jd);
  };

  const handleRunMatch = async () => {
    if (!selectedResumeId || !jobDescription) return;

    try {
      setMatchingInProgress(true);
      
      // Simulate/Trigger sequenced loading ticks
      const match = await createJobMatch({
        resumeId: selectedResumeId,
        jobDescriptionId: jobDescription._id,
      });

      // Brief delay to let the premium sequenced loaders complete smoothly
      await new Promise((resolve) => setTimeout(resolve, 5200));

      setMatchResult(match);
      toast.success('AI Job Matching completed!');
      loadHistory(1); // refresh history list
    } catch (err) {
      toast.error('AI Matching failed. Please try again.');
    } finally {
      setMatchingInProgress(false);
    }
  };

  const handleOpenHistoryMatch = async (matchId) => {
    try {
      setLoading(true);
      const detail = await getJobMatchDetails(matchId);
      setMatchResult(detail);
      setJobDescription(detail.jobDescriptionId);
      setSelectedResumeId(detail.resumeId?._id);
    } catch (err) {
      toast.error('Failed to retrieve past match details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (e, matchId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this match record?')) return;

    try {
      await deleteJobMatch(matchId);
      toast.success('Match record removed.');
      loadHistory(historyPage);
      if (matchResult && matchResult.jobMatchId === matchId) {
        handleReset();
      }
    } catch (err) {
      toast.error('Failed to delete match.');
    }
  };

  const handleReset = () => {
    setMatchResult(null);
    setJobDescription(null);
    setJobTitle('');
    setCompanyName('');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <LoadingSkeleton className="h-12 w-1/3 rounded-xl" />
          <LoadingSkeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (matchingInProgress) {
    return (
      <AppLayout>
        <MatchLoadingAnimation />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex items-center gap-3">
          {matchResult && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="p-2 text-text-muted hover:text-text-primary rounded-xl"
              aria-label="Back to config"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary shadow-xs">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-h1 font-black text-text-primary">
              {matchResult ? 'Match Report' : 'AI Job Description Matching'}
            </h1>
            <p className="text-body-sm text-text-muted mt-0.5">
              {matchResult
                ? `Compatibility scorecard for ${jobDescription?.jobTitle || 'Untitled Role'} at ${jobDescription?.companyName || 'Unknown Company'}`
                : 'Compare your resume against any role description to check scores and find gaps.'}
            </p>
          </div>
        </div>

        {/* Dashboard matched metrics display */}
        {matchResult ? (
          <div className="space-y-6">
            {/* Top row: Gauge & Priority list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <CompatibilityGauge score={matchResult.overallScore} />
              </div>
              <div className="md:col-span-2">
                <PriorityActionCard actions={matchResult.priorityActions || []} />
              </div>
            </div>

            {/* Category score breakdowns */}
            <MatchScoreCard scores={matchResult.sectionScores} />

            {/* Resume vs JD comparison table */}
            <div>
              <h3 className="text-body font-bold text-text-primary mb-3">Target Comparison Details</h3>
              <ComparisonTable
                resume={matchResult.resumeId}
                jd={jobDescription}
                match={matchResult}
              />
            </div>

            {/* Matched vs Missing Skills */}
            <SkillsComparison
              matchedSkills={matchResult.matchedSkills}
              missingSkills={matchResult.missingSkills}
            />

            {/* Matched vs Missing Keywords */}
            <KeywordComparison
              matchedKeywords={matchResult.matchedKeywords}
              missingKeywords={matchResult.missingKeywords}
            />

            {/* Feedback panels */}
            <RecommendationPanel
              recommendations={matchResult.recommendations}
              improvements={matchResult.resumeImprovements}
              strengths={matchResult.strengths}
              weaknesses={matchResult.weaknesses}
            />

            <div className="flex justify-end pt-4">
              <Button variant="secondary" onClick={handleReset}>
                Match Another Role
              </Button>
            </div>
          </div>
        ) : (
          /* Main Configuration Area */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Setup Block */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
                {/* 1. Select Resume */}
                <div className="flex flex-col gap-2">
                  <label className="text-body-sm font-bold text-text-secondary">
                    1. Select Candidate Resume
                  </label>
                  {resumes.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-border rounded-xl">
                      <p className="text-body-sm text-text-muted italic">No completed resumes found. Please upload a resume first.</p>
                    </div>
                  ) : (
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-body-sm text-text-primary focus:border-primary focus:outline-none"
                    >
                      {resumes.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.fileName} (v{r.versionNumber})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 2. Optional JD Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-body-sm font-bold text-text-secondary">
                      Job Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Frontend Engineer"
                      className="rounded-xl border border-border bg-surface px-4 py-3 text-body-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-body-sm font-bold text-text-secondary">
                      Company Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Flipkart"
                      className="rounded-xl border border-border bg-surface px-4 py-3 text-body-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <hr className="border-border" />

                {/* 3. JD Input Tab */}
                <div className="space-y-4">
                  <div className="flex border-b border-border">
                    <button
                      onClick={() => {
                        setActiveInputTab('paste');
                        setJobDescription(null);
                      }}
                      className={`px-4 py-2.5 text-body-sm font-bold border-b-2 transition-all outline-none ${
                        activeInputTab === 'paste'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-text-muted hover:text-text-primary'
                      }`}
                    >
                      Paste Text
                    </button>
                    <button
                      onClick={() => {
                        setActiveInputTab('upload');
                        setJobDescription(null);
                      }}
                      className={`px-4 py-2.5 text-body-sm font-bold border-b-2 transition-all outline-none ${
                        activeInputTab === 'upload'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-text-muted hover:text-text-primary'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>

                  {!jobDescription ? (
                    activeInputTab === 'paste' ? (
                      <JobDescriptionEditor
                        onUploadSuccess={handleJDParsed}
                        jobTitle={jobTitle}
                        companyName={companyName}
                      />
                    ) : (
                      <JobDescriptionUpload
                        onUploadSuccess={handleJDParsed}
                        jobTitle={jobTitle}
                        companyName={companyName}
                      />
                    )
                  ) : (
                    /* JD successfully parsed checklist state */
                    <div className="rounded-xl border border-success/20 bg-success/5 dark:bg-success/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-light text-success mt-0.5 sm:mt-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-body-sm font-bold text-success">
                            Role Description Parsed successfully
                          </p>
                          <p className="text-caption text-text-secondary mt-0.5">
                            {jobDescription.jobTitle} — {jobDescription.companyName}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setJobDescription(null)}
                        >
                          Change JD
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleRunMatch}
                          disabled={!selectedResumeId}
                          className="font-bold flex items-center gap-1.5"
                        >
                          <Target className="h-4 w-4" />
                          <span>Compare Fit</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar past matches history list */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
                <h3 className="text-body font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Matching History</span>
                </h3>

                {matchHistory.length === 0 ? (
                  <p className="text-body-sm text-text-muted italic py-4">No past evaluations found.</p>
                ) : (
                  <div className="space-y-3">
                    {matchHistory.map((item) => (
                      <div
                        key={item.jobMatchId}
                        onClick={() => handleOpenHistoryMatch(item.jobMatchId)}
                        className="group flex flex-col justify-between border border-border hover:border-primary/30 p-3.5 rounded-xl cursor-pointer hover:bg-surface-alt/25 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-body-sm font-bold text-text-primary group-hover:text-primary truncate">
                              {item.jobDescriptionId?.jobTitle || 'Untitled Role'}
                            </p>
                            <p className="text-[11px] text-text-muted mt-0.5 truncate">
                              {item.jobDescriptionId?.companyName || 'Unknown Company'}
                            </p>
                          </div>
                          <span className="text-body-sm font-black text-primary shrink-0 bg-primary-light dark:bg-primary/20 px-2 py-0.5 rounded-md">
                            {item.overallScore}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/40 mt-3 pt-2.5">
                          <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(item.createdAt)}
                          </span>
                          <button
                            onClick={(e) => handleDeleteMatch(e, item.jobMatchId)}
                            className="text-text-muted hover:text-danger p-1 rounded-md hover:bg-danger-light dark:hover:bg-danger/20 transition-colors"
                            title="Delete match"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default JobMatchingPage;
