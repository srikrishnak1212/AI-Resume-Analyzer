import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/common/AppLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import { getParsedContent, triggerParse } from '../../services/resumeService';
import { ROUTES } from '../../utils/constants';
import {
  FileText,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatDate';

/**
 * ParsedPreviewPage — Displays extracted text and structured sections.
 * Supports polling, error messages, and re-triggering parse.
 *
 * Reference: UI-Guide.md §7.8 (Resume Preview Page)
 * Rule: Functional Component + Hooks only (PROJECT_RULES.md)
 */
const ParsedPreviewPage = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  // State management
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [activeTab, setActiveTab] = useState('structured'); // 'structured' | 'raw'
  const [copied, setCopied] = useState(false);

  // Poll timeout reference
  const pollTimerRef = useRef(null);

  // Fetch parsed content
  const fetchContent = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const result = await getParsedContent(resumeId);
      setData(result);
      setError(null);

      // If still processing or pending, poll in 1.5 seconds
      if (result.parsingStatus === 'Pending' || result.parsingStatus === 'Processing') {
        pollTimerRef.current = setTimeout(() => {
          fetchContent(false);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to retrieve parsed content.');
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    fetchContent(true);

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [resumeId, fetchContent]);

  // Handle re-triggering parse
  const handleRetryParse = async () => {
    setIsRetrying(true);
    try {
      await triggerParse(resumeId);
      toast.success('Parsing triggered. Processing resume...');
      fetchContent(true);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to trigger parsing.');
    } finally {
      setIsRetrying(false);
    }
  };

  // Copy raw text to clipboard
  const handleCopyText = () => {
    if (!data?.parsedText) return;
    navigator.clipboard.writeText(data.parsedText);
    setCopied(true);
    toast.success('Copied raw text to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  // Get status badge formatting
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2.5 py-0.5 text-caption font-semibold text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-danger-light px-2.5 py-0.5 text-caption font-semibold text-danger">
            <AlertTriangle className="h-3.5 w-3.5" />
            Failed
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-light px-2.5 py-0.5 text-caption font-semibold text-warning animate-pulse">
            <div className="h-1.5 w-1.5 rounded-full bg-warning animate-ping" />
            Processing
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-alt px-2.5 py-0.5 text-caption font-semibold text-text-muted">
            Pending
          </span>
        );
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Button and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.HISTORY)}
            icon={ArrowLeft}
            className="text-text-secondary hover:text-text-primary"
          >
            Back to History
          </Button>

          {data && (data.parsingStatus === 'Completed' || data.parsingStatus === 'Failed') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRetryParse}
              isLoading={isRetrying}
              icon={RefreshCw}
            >
              Re-parse Resume
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading Spinner */}
        {isLoading && !data ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-body-sm text-text-muted animate-pulse">
                Fetching resume status...
              </p>
            </div>
          </div>
        ) : (
          data && (
            <div className="space-y-6">
              {/* Document Overview Header */}
              <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary-light p-3 text-primary shrink-0 dark:bg-primary-light/10">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-h2 font-bold text-text-primary break-all">
                        {data.fileName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-icon-default" />
                          Parsed on {data.parsedAt ? formatDate(data.parsedAt) : 'Pending'}
                        </span>
                        {data.wordCount > 0 && (
                          <span>
                            • <span className="font-semibold">{data.wordCount}</span> words
                          </span>
                        )}
                        {data.pageCount > 0 && (
                          <span>
                            • <span className="font-semibold">{data.pageCount}</span>{' '}
                            {data.pageCount === 1 ? 'page' : 'pages'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>{getStatusBadge(data.parsingStatus)}</div>
                </div>

                {/* Parsing Fail Banner */}
                {data.parsingStatus === 'Failed' && (
                  <div className="mt-6 rounded-md bg-danger-light p-4 text-danger border border-danger/20 flex gap-3 dark:bg-red-950/20">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-body-sm font-semibold">Parsing Error Logged</p>
                      <p className="text-caption text-text-secondary mt-1">{data.parsingError}</p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRetryParse}
                        isLoading={isRetrying}
                        className="mt-3 bg-red-600 hover:bg-red-700 font-semibold"
                      >
                        Retry Parsing
                      </Button>
                    </div>
                  </div>
                )}

                {/* Processing Shimmer Banner */}
                {(data.parsingStatus === 'Pending' || data.parsingStatus === 'Processing') && (
                  <div className="mt-6 rounded-md bg-surface-alt p-5 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Spinner size="md" className="text-primary" />
                      <div>
                        <p className="text-body-sm font-semibold text-text-primary">
                          Extracting text and file structure
                        </p>
                        <p className="text-caption text-text-muted mt-0.5">
                          Please wait. This will take a few seconds...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Content Sections (Tabs) */}
              {data.parsingStatus === 'Completed' && (
                <div className="space-y-4">
                  {/* Tabs Selector */}
                  <div className="flex border-b border-border">
                    <button
                      onClick={() => setActiveTab('structured')}
                      className={`px-4 py-2.5 text-body-sm font-semibold border-b-2 transition-colors duration-150 ${
                        activeTab === 'structured'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Structured Sections
                    </button>
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={`px-4 py-2.5 text-body-sm font-semibold border-b-2 transition-colors duration-150 ${
                        activeTab === 'raw'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Raw Extracted Text
                    </button>
                  </div>

                  {/* Structured Tab View */}
                  {activeTab === 'structured' && (
                    <div className="grid gap-6 lg:grid-cols-3">
                      {/* Left Sidebar: Contact Info & Summary */}
                      <div className="lg:col-span-1 space-y-6">
                        {/* Contact Info Card */}
                        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm space-y-4">
                          <h3 className="text-body font-bold text-text-primary flex items-center gap-2">
                            Contact Info
                          </h3>
                          <div className="space-y-2.5 text-body-sm text-text-secondary">
                            {data.sections?.contactInfo?.name && (
                              <div className="font-bold text-text-primary border-b border-border pb-1">
                                {data.sections.contactInfo.name}
                              </div>
                            )}
                            {data.sections?.contactInfo?.email && (
                              <a
                                href={`mailto:${data.sections.contactInfo.email}`}
                                className="flex items-center gap-2 hover:text-primary transition-colors"
                              >
                                <Mail className="h-4 w-4 shrink-0" />
                                <span className="truncate">{data.sections.contactInfo.email}</span>
                              </a>
                            )}
                            {data.sections?.contactInfo?.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span>{data.sections.contactInfo.phone}</span>
                              </div>
                            )}
                            {data.sections?.contactInfo?.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 shrink-0" />
                                <span>{data.sections.contactInfo.location}</span>
                              </div>
                            )}
                            {data.sections?.contactInfo?.linkedin && (
                              <div className="flex items-center gap-2">
                                <Linkedin className="h-4 w-4 shrink-0" />
                                <span className="truncate">{data.sections.contactInfo.linkedin}</span>
                              </div>
                            )}
                            {data.sections?.contactInfo?.github && (
                              <div className="flex items-center gap-2">
                                <Github className="h-4 w-4 shrink-0" />
                                <span className="truncate">{data.sections.contactInfo.github}</span>
                              </div>
                            )}
                            {data.sections?.contactInfo?.website && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 shrink-0" />
                                <span className="truncate">{data.sections.contactInfo.website}</span>
                              </div>
                            )}
                            {!data.sections?.contactInfo?.email &&
                              !data.sections?.contactInfo?.phone &&
                              !data.sections?.contactInfo?.linkedin && (
                                <p className="text-text-muted italic">No contact info detected.</p>
                              )}
                          </div>
                        </div>

                        {/* Skills Card */}
                        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm space-y-3">
                          <h3 className="text-body font-bold text-text-primary">Skills detected</h3>
                          {data.sections?.skills && data.sections.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {data.sections.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="rounded bg-primary-light/50 px-2 py-0.5 text-caption font-semibold text-primary dark:bg-primary-light/10"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-body-sm text-text-muted italic">
                              No explicit skills list parsed.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Panel: Content Sections */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Summary Section */}
                        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm space-y-3">
                          <h3 className="text-body font-bold text-text-primary">Summary / Profile</h3>
                          {data.sections?.summary ? (
                            <p className="text-body-sm text-text-secondary leading-relaxed whitespace-pre-line">
                              {data.sections.summary}
                            </p>
                          ) : (
                            <p className="text-body-sm text-text-muted italic">
                              No summary section parsed.
                            </p>
                          )}
                        </div>

                        {/* Experience Section */}
                        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm space-y-3">
                          <h3 className="text-body font-bold text-text-primary">Experience</h3>
                          {data.sections?.experience && data.sections.experience.length > 0 ? (
                            <div className="space-y-4">
                              {data.sections.experience.map((item, idx) => (
                                <div key={idx} className="border-l-2 border-border pl-3.5 py-0.5">
                                  {item.raw ? (
                                    <p className="text-body-sm text-text-secondary leading-relaxed whitespace-pre-line">
                                      {item.raw}
                                    </p>
                                  ) : (
                                    <pre className="text-caption text-text-secondary whitespace-pre-wrap font-sans">
                                      {JSON.stringify(item, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-body-sm text-text-muted italic">
                              No work experience entries parsed.
                            </p>
                          )}
                        </div>

                        {/* Education Section */}
                        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm space-y-3">
                          <h3 className="text-body font-bold text-text-primary">Education</h3>
                          {data.sections?.education && data.sections.education.length > 0 ? (
                            <div className="space-y-3">
                              {data.sections.education.map((item, idx) => (
                                <div key={idx} className="border-l-2 border-border pl-3.5 py-0.5">
                                  {item.raw ? (
                                    <p className="text-body-sm text-text-secondary whitespace-pre-line">
                                      {item.raw}
                                    </p>
                                  ) : (
                                    <pre className="text-caption text-text-secondary whitespace-pre-wrap font-sans">
                                      {JSON.stringify(item, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-body-sm text-text-muted italic">
                              No academic entries parsed.
                            </p>
                          )}
                        </div>

                        {/* Projects Section */}
                        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm space-y-3">
                          <h3 className="text-body font-bold text-text-primary">Projects</h3>
                          {data.sections?.projects && data.sections.projects.length > 0 ? (
                            <div className="space-y-3">
                              {data.sections.projects.map((item, idx) => (
                                <div key={idx} className="border-l-2 border-border pl-3.5 py-0.5">
                                  {item.raw ? (
                                    <p className="text-body-sm text-text-secondary whitespace-pre-line">
                                      {item.raw}
                                    </p>
                                  ) : (
                                    <pre className="text-caption text-text-secondary whitespace-pre-wrap font-sans">
                                      {JSON.stringify(item, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-body-sm text-text-muted italic">
                              No project entries parsed.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Raw Text Tab View */}
                  {activeTab === 'raw' && (
                    <div className="rounded-lg border border-border bg-surface p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <span className="text-caption text-text-secondary font-semibold">
                          Raw Extracted Plain Text ({data.parsedText.length} characters)
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyText}
                          className="text-primary hover:bg-primary-light"
                          icon={copied ? Check : Copy}
                        >
                          {copied ? 'Copied' : 'Copy Text'}
                        </Button>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto rounded bg-surface-alt p-4 border border-border">
                        <pre className="text-caption font-mono text-text-primary whitespace-pre-wrap leading-relaxed select-all">
                          {data.parsedText}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </AppLayout>
  );
};

export default ParsedPreviewPage;
