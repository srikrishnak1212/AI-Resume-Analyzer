import React from 'react';
import { Upload, Sparkles, History, Eye, User } from 'lucide-react';
import DashboardCard from './DashboardCard';
import Button from '../common/Button';

/**
 * QuickActions — Fast shortcuts panel.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const QuickActions = ({
  onUploadClick,
  onAnalyzeClick,
  onHistoryClick,
  onViewLatestClick,
  onProfileClick,
  hasResumes = false,
  hasAnalyses = false,
  className = '',
}) => {
  return (
    <DashboardCard title="Quick Actions" subtitle="Standard tools shortcuts" className={className}>
      <div className="flex flex-col gap-3">
        {/* Upload Resume */}
        <Button
          onClick={onUploadClick}
          className="w-full flex items-center justify-start gap-3 py-2.5 px-4 rounded-xl border border-border bg-surface text-text-primary hover:bg-surface-alt transition-colors font-semibold text-body-sm shadow-xs"
        >
          <Upload className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
          <span>Upload Resume</span>
        </Button>

        {/* Analyze Resume */}
        <Button
          onClick={onAnalyzeClick}
          disabled={!hasResumes}
          className="w-full flex items-center justify-start gap-3 py-2.5 px-4 rounded-xl border border-border bg-surface text-text-primary hover:bg-surface-alt transition-colors font-semibold text-body-sm shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          title={!hasResumes ? 'Please upload a resume first' : 'Analyze your resume'}
        >
          <Sparkles className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
          <span>Analyze Resume</span>
        </Button>

        {/* View Latest Analysis */}
        <Button
          onClick={onViewLatestClick}
          disabled={!hasAnalyses}
          className="w-full flex items-center justify-start gap-3 py-2.5 px-4 rounded-xl border border-border bg-surface text-text-primary hover:bg-surface-alt transition-colors font-semibold text-body-sm shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          title={!hasAnalyses ? 'No analyses run yet' : 'View latest analysis results'}
        >
          <Eye className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
          <span>View Latest Analysis</span>
        </Button>

        {/* Resume History */}
        <Button
          onClick={onHistoryClick}
          className="w-full flex items-center justify-start gap-3 py-2.5 px-4 rounded-xl border border-border bg-surface text-text-primary hover:bg-surface-alt transition-colors font-semibold text-body-sm shadow-xs"
        >
          <History className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
          <span>Resume History</span>
        </Button>

        {/* Profile Settings */}
        <Button
          onClick={onProfileClick}
          className="w-full flex items-center justify-start gap-3 py-2.5 px-4 rounded-xl border border-border bg-surface text-text-primary hover:bg-surface-alt transition-colors font-semibold text-body-sm shadow-xs"
        >
          <User className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
          <span>Profile Settings</span>
        </Button>
      </div>
    </DashboardCard>
  );
};

export default QuickActions;
