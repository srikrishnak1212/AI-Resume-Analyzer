import { FileText, Trash2, Calendar, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import Button from './Button';
import { formatDate } from '../../utils/formatDate';

/**
 * ResumeCard — Displays key resume info, version badge, state and quick actions.
 *
 * Reference: UI-Guide.md §5.7 (Card Variants), §6.10 (Badges)
 * Rule: Functional Component + Hooks only (PROJECT_RULES.md)
 */
const ResumeCard = ({ resume, onViewDetail, onDelete, onRetry, onAnalyze, isDeleting = false, isRetrying = false }) => {
  const {
    _id,
    fileName,
    versionNumber,
    versionLabel,
    createdAt,
    fileSize,
    fileType,
    parsingStatus,
    analysisStatus,
  } = resume;

  const formattedDate = formatDate(createdAt);
  const formattedSize = (fileSize / 1024).toFixed(0) + ' KB';
  const isPdf = fileType === 'application/pdf';

  return (
    <div className="group relative rounded-lg border border-border bg-surface p-5 shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-150">
      <div className="flex items-start justify-between gap-4">
        {/* File Type Icon & Names */}
        <div className="flex items-start gap-3">
          <div className={`rounded-lg p-2.5 shrink-0 ${
            isPdf
              ? 'bg-danger-light text-danger dark:bg-red-950/30'
              : 'bg-info/10 text-info dark:bg-blue-950/30'
          }`}>
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4
              onClick={() => parsingStatus === 'Completed' && onViewDetail && onViewDetail(_id)}
              className={`text-body font-bold text-text-primary transition-colors duration-150 line-clamp-1 break-all ${
                parsingStatus === 'Completed' ? 'group-hover:text-primary cursor-pointer' : 'cursor-default'
              }`}
            >
              {fileName}
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary-light px-2 py-0.5 text-caption font-semibold text-primary">
                v{versionNumber}
              </span>
              {versionLabel && (
                <span className="inline-flex items-center rounded-full bg-surface-alt px-2 py-0.5 text-caption font-medium text-text-secondary truncate max-w-[120px]">
                  {versionLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity duration-150">
          {parsingStatus === 'Failed' && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRetry(_id)}
              isLoading={isRetrying}
              className="p-1.5 text-text-muted hover:text-primary"
              title="Retry Parsing"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete && onDelete(_id)}
            isLoading={isDeleting}
            className="p-1.5 text-text-muted hover:text-danger"
            title="Delete Resume"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {parsingStatus === 'Completed' && (
        <div className="mt-4 flex gap-2">
          <Button
            variant={analysisStatus === 'completed' ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => onAnalyze && onAnalyze(_id)}
            className="w-full text-xs font-semibold py-1.5 flex items-center justify-center gap-1"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {analysisStatus === 'completed'
                ? 'View Score'
                : analysisStatus === 'processing'
                ? 'Analyzing...'
                : 'Analyze Resume'}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetail && onViewDetail(_id)}
            className="text-xs py-1.5 border border-border bg-surface hover:bg-surface-alt"
          >
            View Text
          </Button>
        </div>
      )}

      {/* Metadata / Footer */}
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-caption text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-icon-default" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{formattedSize}</span>
          <span className="text-text-muted font-light">•</span>
          {parsingStatus === 'Completed' && (
            <span className="flex items-center gap-1 text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Parsed</span>
            </span>
          )}
          {parsingStatus === 'Failed' && (
            <span className="flex items-center gap-1 text-danger">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Failed</span>
            </span>
          )}
          {parsingStatus === 'Processing' && (
            <span className="flex items-center gap-1.5 text-warning animate-pulse">
              <div className="h-1.5 w-1.5 rounded-full bg-warning animate-ping" />
              <span>Processing...</span>
            </span>
          )}
          {parsingStatus === 'Pending' && (
            <span className="flex items-center gap-1 text-text-muted">
              <div className="h-1.5 w-1.5 rounded-full bg-border-strong animate-pulse" />
              <span>Pending</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeCard;
