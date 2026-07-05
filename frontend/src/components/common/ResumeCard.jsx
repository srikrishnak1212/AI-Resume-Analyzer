import { FileText, Trash2, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from './Button';
import { formatDate } from '../../utils/formatDate';

/**
 * ResumeCard — Displays key resume info, version badge, state and quick actions.
 *
 * Reference: UI-Guide.md §5.7 (Card Variants), §6.10 (Badges)
 * Rule: Functional Component + Hooks only (PROJECT_RULES.md)
 */
const ResumeCard = ({ resume, onViewDetail, onDelete, isDeleting = false }) => {
  const {
    _id,
    fileName,
    versionNumber,
    versionLabel,
    createdAt,
    fileSize,
    fileType,
    parsingStatus,
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
              onClick={() => onViewDetail && onViewDetail(_id)}
              className="text-body font-bold text-text-primary group-hover:text-primary cursor-pointer transition-colors duration-150 line-clamp-1 break-all"
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

      {/* Metadata / Footer */}
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-caption text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-icon-default" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{formattedSize}</span>
          <span className="text-text-muted font-light">•</span>
          {parsingStatus === 'success' && (
            <span className="flex items-center gap-1 text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Parsed</span>
            </span>
          )}
          {parsingStatus === 'failed' && (
            <span className="flex items-center gap-1 text-danger">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Parsing Failed</span>
            </span>
          )}
          {parsingStatus === 'pending' && (
            <span className="flex items-center gap-1 text-warning animate-pulse">
              <div className="h-2 w-2 rounded-full bg-warning" />
              <span>Processing...</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeCard;
