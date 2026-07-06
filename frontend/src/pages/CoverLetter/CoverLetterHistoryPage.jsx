import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { listCoverLetters, deleteCoverLetter, downloadCoverLetterPDF, downloadCoverLetterDOCX } from '../../services/coverLetterService';
import toast from 'react-hot-toast';
import { FileText, Trash2, Calendar, FileDown, Eye, Copy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';

const CoverLetterHistoryPage = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async (p) => {
    try {
      setLoading(true);
      const data = await listCoverLetters({ page: p, limit: 10 });
      setHistory(data.coverLetters || []);
      setPage(p);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load cover letters history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this cover letter?')) return;

    try {
      await deleteCoverLetter(id);
      toast.success('Cover letter deleted.');
      fetchHistory(page);
    } catch (err) {
      toast.error('Failed to delete cover letter.');
    }
  };

  const handleDownload = async (e, id, title, format) => {
    e.stopPropagation();
    try {
      toast(`Downloading ${format.toUpperCase()}...`);
      const blob = format === 'pdf'
        ? await downloadCoverLetterPDF(id)
        : await downloadCoverLetterDOCX(id);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CoverLetter_${title.replace(/\s+/g, '_')}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error(`Failed to download ${format.toUpperCase()}.`);
    }
  };

  const handleCopyText = (e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success('Copied cover letter text!');
  };

  if (loading && history.length === 0) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <LoadingSkeleton className="h-12 w-1/3 rounded-xl" />
          <LoadingSkeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/cover-letter')}
            className="p-2 text-text-muted hover:text-text-primary rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary shadow-xs">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-h1 font-black text-text-primary">Cover Letter History</h1>
            <p className="text-body-sm text-text-muted mt-0.5">
              Access and download your previously generated cover letters.
            </p>
          </div>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-text-muted mb-4" />
            <p className="text-body font-bold text-text-primary">No cover letters generated yet</p>
            <p className="text-body-sm text-text-secondary mt-1">
              Create your first cover letter to see it here.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/cover-letter')}
              className="mt-5"
            >
              Generate Cover Letter
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {history.map((item) => (
                <div
                  key={item.coverLetterId}
                  className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-body font-bold text-text-primary leading-tight">
                          {item.jobTitle}
                        </h3>
                        <p className="text-caption text-text-muted mt-0.5">
                          {item.companyName}
                        </p>
                      </div>
                      <span className="inline-flex rounded-lg bg-surface-alt px-2.5 py-1 text-[11px] font-bold text-text-secondary border border-border/80">
                        {item.tone}
                      </span>
                    </div>

                    <p className="text-body-sm text-text-secondary line-clamp-4 leading-relaxed font-serif bg-surface-alt/10 p-3 rounded-xl border border-border/40 whitespace-pre-wrap">
                      {item.coverLetterText}
                    </p>
                  </div>

                  <div className="border-t border-border/60 mt-4 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-text-muted flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(item.createdAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleCopyText(e, item.coverLetterText)}
                        className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface-alt transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDownload(e, item.coverLetterId, item.jobTitle, 'pdf')}
                        className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface-alt transition-colors"
                        title="Download PDF"
                      >
                        <FileDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDownload(e, item.coverLetterId, item.jobTitle, 'docx')}
                        className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface-alt transition-colors"
                        title="Download Word"
                      >
                        <FileDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, item.coverLetterId)}
                        className="p-2 text-text-muted hover:text-danger rounded-lg hover:bg-danger-light dark:hover:bg-danger/20 transition-colors ml-1"
                        title="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => fetchHistory(page - 1)}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-body-sm font-semibold flex items-center">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => fetchHistory(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CoverLetterHistoryPage;
