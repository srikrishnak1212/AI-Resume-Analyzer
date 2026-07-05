import { X, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

/**
 * UploadProgress — displays upload progress, file details, and state.
 *
 * Reference: UI-Guide.md §6.7 (Progress Bars)
 * Rule: Functional Component + Hooks only (PROJECT_RULES.md)
 */
const UploadProgress = ({
  fileName,
  fileSize,
  progress,
  status = 'uploading', // 'uploading' | 'parsing' | 'success' | 'error'
  errorMsg = '',
  onCancel,
}) => {
  const formattedSize = (fileSize / (1024 * 1024)).toFixed(2) + ' MB';

  return (
    <div className="mt-4 rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-light p-2 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-body-sm font-semibold text-text-primary truncate max-w-[240px] sm:max-w-md">
              {fileName}
            </p>
            <p className="text-caption text-text-muted">{formattedSize}</p>
          </div>
        </div>

        {status === 'uploading' && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="p-1 text-text-muted hover:text-text-primary"
            aria-label="Cancel upload"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="mt-4">
        {status === 'uploading' && (
          <div>
            <div className="flex items-center justify-between text-caption text-text-secondary mb-1">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-alt overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === 'parsing' && (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
            <span className="text-body-sm text-text-secondary animate-pulse">
              Extracting text and structure...
            </span>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="text-body-sm font-medium">Upload and parsing completed!</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-start gap-2 text-danger">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <span className="text-body-sm font-medium block">Failed to process resume</span>
              <span className="text-caption text-text-secondary">{errorMsg || 'Please try again.'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadProgress;
