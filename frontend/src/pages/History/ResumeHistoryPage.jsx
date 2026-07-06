import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/common/AppLayout';
import ResumeCard from '../../components/common/ResumeCard';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import { listResumes, deleteResume, triggerParse } from '../../services/resumeService';
import { History, UploadCloud, ChevronLeft, ChevronRight } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import toast from 'react-hot-toast';

/**
 * ResumeHistoryPage — Lists all uploaded resumes for the authenticated user.
 * Supports pagination, viewing status, and soft delete.
 *
 * Reference: UI-Guide.md §6.9 (Tables/Lists), §6.14 (Empty States), §7.14 (Reports Page)
 * Rule: Functional Component + Hooks only (PROJECT_RULES.md)
 */
const ResumeHistoryPage = () => {
  const navigate = useNavigate();

  // State management
  const [resumes, setResumes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [retryingId, setRetryingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch resumes list
  const fetchResumes = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listResumes({ page, limit: 6 });
      setResumes(data.resumes || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to retrieve resume history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes(currentPage);
  }, [currentPage]);

  // Handle viewing parsed preview
  const handleViewDetail = (id) => {
    navigate(`/resumes/${id}/preview`);
  };

  // Handle re-triggering parse for failed documents
  const handleRetry = async (id) => {
    setRetryingId(id);
    try {
      await triggerParse(id);
      toast.success('Resume parsing re-triggered successfully.');
      fetchResumes(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to trigger parsing.');
    } finally {
      setRetryingId(null);
    }
  };

  // Handle soft deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume version? This cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteResume(id);
      toast.success('Resume deleted successfully.');

      // Adjust page if deleting the last item on current page
      if (resumes.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchResumes(currentPage);
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete resume.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-h1 font-bold text-text-primary flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              Resume History
            </h1>
            <p className="text-body-sm text-text-secondary">
              Manage your uploaded resume files and versions.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            icon={UploadCloud}
          >
            Upload New
          </Button>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-body-sm text-text-muted">Loading resume history...</p>
            </div>
          </div>
        ) : resumes.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center shadow-xs">
            <div className="rounded-full bg-surface-alt p-4 text-icon-default mb-4">
              <UploadCloud className="h-10 w-10 text-text-muted" />
            </div>
            <h3 className="text-h3 font-bold text-text-primary">No resumes uploaded yet</h3>
            <p className="text-body-sm text-text-secondary mt-1.5 max-w-sm">
              Upload your first resume file to check formatting and extract metadata.
            </p>
            <Button
              variant="primary"
              className="mt-6"
              onClick={() => navigate(ROUTES.DASHBOARD)}
            >
              Upload Resume
            </Button>
          </div>
        ) : (
          /* Resume Grid List */
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume._id}
                  resume={resume}
                  onViewDetail={handleViewDetail}
                  onDelete={handleDelete}
                  onRetry={handleRetry}
                  onAnalyze={(id) => navigate(`/analysis/${id}`)}
                  isDeleting={deletingId === resume._id}
                  isRetrying={retryingId === resume._id}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
                <p className="text-caption text-text-secondary">
                  Showing page <span className="font-semibold">{pagination.page}</span> of{' '}
                  <span className="font-semibold">{pagination.totalPages}</span> ({pagination.total} total items)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    isDisabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    icon={ChevronLeft}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    isDisabled={currentPage === pagination.totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    icon={ChevronRight}
                    iconPosition="right"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ResumeHistoryPage;
