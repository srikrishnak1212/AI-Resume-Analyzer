import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsCard from '../../components/dashboard/StatsCard';
import QuickActions from '../../components/dashboard/QuickActions';
import RecentActivity from '../../components/dashboard/RecentActivity';
import ProfileSummary from '../../components/dashboard/ProfileSummary';
import NotificationPanel from '../../components/dashboard/NotificationPanel';
import EmptyState from '../../components/dashboard/EmptyState';
import DashboardSkeleton from '../../components/dashboard/LoadingSkeleton';
import UploadZone from '../../components/upload/UploadZone';
import UploadProgress from '../../components/upload/UploadProgress';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { uploadResume, getResume, triggerParse } from '../../services/resumeService';
import { getDashboardStats } from '../../services/dashboardService';
import { FileText, Sparkles, Plus, RefreshCw, Target, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * DashboardPage — Core SaaS Home Dashboard Viewport.
 *
 * Reference: UI-Guide.md §7.5, Implementation-Guide.md Phase 6A
 * Rule: Functional Component + Hooks only (PROJECT_RULES.md)
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dashboard metrics state
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Upload modal state management
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [versionLabel, setVersionLabel] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'parsing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [createdResumeId, setCreatedResumeId] = useState(null);

  // Fetch metrics data
  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // File selection callback
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setShowLabelInput(true);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMsg('');
    setCreatedResumeId(null);
  };

  // Poll background parsing status
  const pollParsingStatus = async (resumeId) => {
    try {
      const result = await getResume(resumeId);
      const resume = result.resume;

      if (resume.parsingStatus === 'Completed') {
        setUploadStatus('success');
        toast.success('Resume parsed successfully!');
        // Refresh dashboard overview data
        await fetchMetrics();
        // Redirect to analysis trigger page
        setTimeout(() => {
          setIsUploadModalOpen(false);
          handleReset();
          navigate(`/analysis/${resumeId}`);
        }, 1200);
      } else if (resume.parsingStatus === 'Failed') {
        setUploadStatus('error');
        setErrorMsg(resume.parsingError || 'Resume extraction failed.');
      } else {
        // Poll status again in 1.5 seconds
        setTimeout(() => {
          pollParsingStatus(resumeId);
        }, 1500);
      }
    } catch (err) {
      setUploadStatus('error');
      setErrorMsg(err.response?.data?.error?.message || 'Error tracking parse progress.');
    }
  };

  // Upload trigger
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMsg('');

    try {
      const result = await uploadResume(selectedFile, versionLabel, ({ loaded, total }) => {
        const percentage = Math.round((loaded * 100) / total);
        setUploadProgress(percentage);
      });

      const resumeId = result.resume?._id;
      setCreatedResumeId(resumeId);
      setUploadStatus('parsing');

      // Trigger status polling
      pollParsingStatus(resumeId);
    } catch (err) {
      setUploadStatus('error');
      const msg = err.response?.data?.error?.message || 'Error uploading file.';
      setErrorMsg(msg);
    }
  };

  // Retry parsing trigger
  const handleRetry = async () => {
    if (!createdResumeId) return;

    setUploadStatus('parsing');
    setErrorMsg('');

    try {
      await triggerParse(createdResumeId);
      pollParsingStatus(createdResumeId);
    } catch (err) {
      setUploadStatus('error');
      setErrorMsg(err.response?.data?.error?.message || 'Failed to re-trigger parsing.');
    }
  };

  // Reset upload states
  const handleReset = () => {
    setSelectedFile(null);
    setVersionLabel('');
    setUploadStatus('idle');
    setUploadProgress(0);
    setShowLabelInput(false);
    setCreatedResumeId(null);
  };

  // Action link buttons callbacks
  const handleAnalyzeLatest = () => {
    if (dashboardData?.metrics?.latestResume?.resumeId) {
      navigate(`/analysis/${dashboardData.metrics.latestResume.resumeId}`);
    } else {
      toast.error('No resume uploaded yet.');
    }
  };

  const handleProfileSettings = () => {
    toast.success('Settings are locked. Coming soon in Phase 8.');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader title="Dashboard" description="Loading metrics overview..." />
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  const { userProfile, metrics, quickStatistics, recentActivities } = dashboardData || {};
  const hasResumes = metrics?.totalResumes > 0;
  const hasAnalyses = metrics?.totalAnalyses > 0;

  return (
    <DashboardLayout>
      {/* Header bar */}
      <DashboardHeader
        title="Dashboard"
        description="Comprehensive overview of your resume feedback activities."
      >
        <span className="inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary dark:bg-primary-light/10 select-none">
          {userProfile?.planTier || 'Free'} Tier
        </span>
      </DashboardHeader>

      {/* Empty State checks */}
      {!hasResumes ? (
        <EmptyState onUploadClick={() => setIsUploadModalOpen(true)} className="max-w-4xl mx-auto py-16" />
      ) : (
        <div className="space-y-6">
          {/* Stats Cards Row */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              icon={FileText}
              title="Total Resumes"
              value={metrics.totalResumes}
              description={`${quickStatistics.resumeVersionsCount} uploaded version file${quickStatistics.resumeVersionsCount === 1 ? '' : 's'}`}
            />
            <StatsCard
              icon={Sparkles}
              title="Total Analyses"
              value={metrics.totalAnalyses}
              description={`Average overall score: ${quickStatistics.averageOverallScore}/100`}
            />
            <StatsCard
              icon={Target}
              title="Latest ATS Score"
              value={metrics.latestAtsScore !== null ? `${metrics.latestAtsScore}/100` : 'N/A'}
              description={metrics.latestAtsScore !== null ? `Evaluation score: ${metrics.latestOverallScore}/100` : 'Analyze to get score'}
            />
            <StatsCard
              icon={Calendar}
              title="Account Age"
              value={`${metrics.accountAgeDays} Day${metrics.accountAgeDays === 1 ? '' : 's'}`}
              description={`Registered on ${new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            />
          </div>

          {/* Grid Layout Main */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Actions / History Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions Panel */}
              <QuickActions
                onUploadClick={() => setIsUploadModalOpen(true)}
                onAnalyzeClick={handleAnalyzeLatest}
                onViewLatestClick={handleAnalyzeLatest}
                onHistoryClick={() => navigate('/history')}
                onProfileClick={handleProfileSettings}
                hasResumes={hasResumes}
                hasAnalyses={hasAnalyses}
              />

              {/* Recent Activity Timeline Feed */}
              <RecentActivity activities={recentActivities} />
            </div>

            {/* Right Profile / Alerts Column */}
            <div className="space-y-6">
              {/* Profile details */}
              <ProfileSummary userProfile={userProfile} metrics={metrics} />

              {/* Notification feed */}
              <NotificationPanel />
            </div>
          </div>
        </div>
      )}

      {/* Upload Dialog Modal Wrapper */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-xl border border-border bg-surface p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => {
                handleReset();
                setIsUploadModalOpen(false);
              }}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1 rounded-md transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-primary-light p-2.5 text-primary dark:bg-primary-light/10">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text-primary tracking-tight">Upload Resume</h3>
                <p className="text-body-sm text-text-secondary">
                  PDF or DOCX documents up to 5MB.
                </p>
              </div>
            </div>

            {/* File Drag zone */}
            {uploadStatus === 'idle' && !selectedFile && (
              <UploadZone onFileSelect={handleFileSelect} />
            )}

            {/* Version labeling entry */}
            {selectedFile && uploadStatus === 'idle' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface-alt p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-lg bg-primary-light p-2 text-primary dark:bg-primary-light/10 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-body-sm font-bold text-text-primary truncate max-w-[200px] sm:max-w-[320px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-text-muted font-semibold mt-0.5">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-text-muted hover:text-text-primary font-bold text-body-sm px-2.5 py-1"
                  >
                    Change
                  </Button>
                </div>

                {showLabelInput && (
                  <div className="space-y-2">
                    <label htmlFor="versionLabel" className="text-caption font-bold text-text-secondary uppercase">
                      Version Label (Optional)
                    </label>
                    <Input
                      id="versionLabel"
                      placeholder="e.g. Added software engineer experience details"
                      value={versionLabel}
                      onChange={(e) => setVersionLabel(e.target.value)}
                      maxLength={50}
                    />
                    <p className="text-[11px] text-text-muted leading-normal">
                      Provides descriptive tag to identify this resume edition.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      handleReset();
                      setIsUploadModalOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleUpload} icon={Plus}>
                    Upload & Parse
                  </Button>
                </div>
              </div>
            )}

            {/* Shimmer loading bar */}
            {uploadStatus !== 'idle' && (
              <div className="space-y-4">
                <UploadProgress
                  fileName={selectedFile?.name || ''}
                  fileSize={selectedFile?.size || 0}
                  progress={uploadProgress}
                  status={uploadStatus}
                  errorMsg={errorMsg}
                  onCancel={() => {
                    handleReset();
                    setIsUploadModalOpen(false);
                  }}
                />
                {uploadStatus === 'error' && (
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={handleReset}>
                      Try Another File
                    </Button>
                    {createdResumeId && (
                      <Button variant="primary" onClick={handleRetry} icon={RefreshCw}>
                        Retry Parsing
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;
