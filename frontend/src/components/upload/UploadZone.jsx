import { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import Alert from '../common/Alert';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_LABEL, ACCEPTED_FILE_EXTENSIONS } from '../../utils/constants';

/**
 * UploadZone — Drag-and-drop resume upload zone with validation.
 *
 * Reference: UI-Guide.md §6.6 (Upload Area)
 * Rule: Functional Component + Hooks only (PROJECT_RULES.md)
 */
const UploadZone = ({ onFileSelect, isDisabled = false }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    setError(null);

    if (!file) return false;

    // Validate size (5MB limit)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size exceeds the ${MAX_FILE_SIZE_LABEL} limit.`);
      return false;
    }

    // Validate file extension / type
    const fileName = file.name.toLowerCase();
    const hasValidExt = ACCEPTED_FILE_EXTENSIONS.some((ext) => fileName.endsWith(ext));

    if (!hasValidExt) {
      setError(`Unsupported file format. Please upload a PDF or DOCX file.`);
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDisabled) return;

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (isDisabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (isDisabled) return;

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-all duration-150 focus-within:ring-2 focus-within:ring-primary/20 ${
          isDragActive
            ? 'border-primary bg-primary-light/50 dark:bg-primary-light/10'
            : 'border-border-strong bg-surface hover:border-primary hover:bg-surface-alt/50'
        } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept={ACCEPTED_FILE_EXTENSIONS.join(',')}
          onChange={handleChange}
          disabled={isDisabled}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="rounded-full bg-surface-alt p-3 text-icon-default group-hover:scale-105 group-hover:text-primary transition-all duration-150">
            <UploadCloud className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <p className="text-body-lg font-semibold text-text-primary">
              Drag & drop your resume here
            </p>
            <p className="text-body-sm text-text-secondary">
              or <span className="font-semibold text-primary group-hover:underline">browse files</span> from your computer
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1 rounded bg-surface-alt px-2 py-1 text-caption font-medium text-text-secondary border border-border">
              PDF
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-surface-alt px-2 py-1 text-caption font-medium text-text-secondary border border-border">
              DOCX
            </span>
            <span className="text-caption text-text-muted">
              Max size {MAX_FILE_SIZE_LABEL}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mt-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </div>
  );
};

export default UploadZone;
