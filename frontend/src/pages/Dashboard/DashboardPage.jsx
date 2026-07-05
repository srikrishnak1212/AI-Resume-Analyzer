import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/common/AppLayout';
import UploadZone from '../../components/upload/UploadZone';
import UploadProgress from '../../components/upload/UploadProgress';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { uploadResume } from '../../services/resumeService';
import { FileText, Sparkles, Plus } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

/**
 * DashboardPage — Authenticated entry point.
 * Incorporates a premium Drag-and-drop resume upload zone, file validation,
 * upload progress, and optional version labeling.
 *
 * Reference: UI-Guide.md §7.5, §7.6 (Upload), §8.1 (Loading Behavior)
 * Rule: Functional Component + Hooks only (PROJECT_RULES.md)
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [versionLabel, setVersionLabel] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'parsing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);

  // File selection callback
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setShowLabelInput(true);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMsg('');
  };

  // Upload trigger
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMsg('');

    try {
      await uploadResume(selectedFile, versionLabel, ({ loaded, total }) => {
        const percentage = Math.round((loaded * 100) / total);
        setUploadProgress(percentage);
        if (percentage >= 100) {
          setUploadStatus('parsing');
        }
      });

      setUploadStatus('success');

      // Refresh user count or redirect to history after short delay
      setTimeout(() => {
        navigate(ROUTES.HISTORY);
      }, 1500);
    } catch (err) {
      setUploadStatus('error');
      const msg = err.response?.data?.error?.message || 'Error uploading file.';
      setErrorMsg(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setVersionLabel('');
    setUploadStatus('idle');
    setUploadProgress(0);
    setShowLabelInput(false);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-h1 font-bold text-text-primary flex items-center gap-2">
              Welcome back, {user?.fullName || 'User'}!
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </h1>
            <p className="text-body-sm text-text-secondary">
              Upload a new resume version to get started.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0 select-none">
            <span className="inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-caption font-semibold uppercase tracking-wider text-primary dark:bg-primary-light/10">
              {user?.planTier || 'free'} tier
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h3 className="text-caption font-bold tracking-wider text-text-muted uppercase">
              Resumes Uploaded
            </h3>
            <p className="mt-2 text-3xl font-extrabold text-text-primary">
              {user?.resumeCount || 0}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h3 className="text-caption font-bold tracking-wider text-text-muted uppercase">
              Current Limitations
            </h3>
            <p className="mt-2 text-body font-semibold text-text-secondary">
              PDF or DOCX, Max 5MB per upload.
            </p>
          </div>
        </div>

        {/* Upload Card */}
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-primary-light p-2.5 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-h3 font-bold text-text-primary">Upload Resume</h3>
              <p className="text-body-sm text-text-secondary">
                Drag-and-drop or select a file to parse and save it.
              </p>
            </div>
          </div>

          {uploadStatus === 'idle' && !selectedFile && (
            <UploadZone onFileSelect={handleFileSelect} />
          )}

          {/* Show file details and version labelling field */}
          {selectedFile && uploadStatus === 'idle' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-alt p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded bg-primary-light p-2 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-text-primary truncate max-w-[200px] sm:max-w-md">
                      {selectedFile.name}
                    </p>
                    <p className="text-caption text-text-secondary">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-text-muted hover:text-text-primary"
                >
                  Change
                </Button>
              </div>

              {showLabelInput && (
                <div className="space-y-2">
                  <label htmlFor="versionLabel" className="text-label text-text-secondary">
                    Version Label (Optional)
                  </label>
                  <Input
                    id="versionLabel"
                    placeholder="e.g. Added software engineer internship"
                    value={versionLabel}
                    onChange={(e) => setVersionLabel(e.target.value)}
                    maxLength={50}
                  />
                  <p className="text-caption text-text-muted">
                    Helps you identify this resume version later (max 50 chars).
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={handleReset}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleUpload} icon={Plus}>
                  Upload & Parse
                </Button>
              </div>
            </div>
          )}

          {/* Show upload progress bar */}
          {uploadStatus !== 'idle' && (
            <div className="space-y-4">
              <UploadProgress
                fileName={selectedFile?.name || ''}
                fileSize={selectedFile?.size || 0}
                progress={uploadProgress}
                status={uploadStatus}
                errorMsg={errorMsg}
                onCancel={handleReset}
              />
              {uploadStatus === 'error' && (
                <div className="flex justify-end pt-2">
                  <Button variant="secondary" onClick={handleReset}>
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
