import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import DiffViewer from '../../components/jobMatch/DiffViewer';
import { getRewriteDetails, acceptRewrite, rejectRewrite } from '../../services/rewriteService';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Check, X, ShieldAlert, Sparkles, FileText } from 'lucide-react';

const RewriteComparisonPage = () => {
  const { rewriteId } = useParams();
  const navigate = useNavigate();

  const [rewrite, setRewrite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [viewMode, setViewMode] = useState('diff'); // 'diff' | 'side'

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await getRewriteDetails(rewriteId);
        setRewrite(data);
      } catch (err) {
        toast.error('Failed to load rewrite details.');
        navigate('/resume-rewrite');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [rewriteId]);

  const handleAccept = async () => {
    try {
      setActioning(true);
      toast('Saving new resume version...');
      const newResume = await acceptRewrite(rewriteId);
      toast.success(`Success! Saved as version v${newResume.versionNumber}`);
      navigate('/history');
    } catch (err) {
      toast.error('Failed to accept rewrite.');
    } finally {
      setActioning(false);
    }
  };

  const handleReject = async () => {
    try {
      setActioning(true);
      await rejectRewrite(rewriteId);
      toast.success('Rewrite rejected.');
      navigate('/resume-rewrite');
    } catch (err) {
      toast.error('Failed to reject rewrite.');
    } finally {
      setActioning(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <LoadingSkeleton className="h-12 w-1/3 rounded-xl" />
          <LoadingSkeleton className="h-96 w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back and Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/resume-rewrite')}
              className="p-2 text-text-muted hover:text-text-primary rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-h1 font-black text-text-primary">Review Rewrite</h1>
              <p className="text-body-sm text-text-muted mt-0.5">
                Section: {rewrite.sectionName} • Mode: {rewrite.rewriteMode}
              </p>
            </div>
          </div>

          <div className="flex rounded-xl bg-surface-alt/60 p-1 border border-border">
            <button
              onClick={() => setViewMode('diff')}
              className={`rounded-lg px-3 py-1.5 text-caption font-bold transition-all outline-none ${
                viewMode === 'diff' ? 'bg-surface text-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Changes Highlighted
            </button>
            <button
              onClick={() => setViewMode('side')}
              className={`rounded-lg px-3 py-1.5 text-caption font-bold transition-all outline-none ${
                viewMode === 'side' ? 'bg-surface text-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Side-by-Side
            </button>
          </div>
        </div>

        {/* Focus Improvements Tag List */}
        {rewrite.improvements?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-caption text-text-muted font-bold uppercase tracking-wider mr-1">
              Focused improvements:
            </span>
            {rewrite.improvements.map((imp) => (
              <span
                key={imp}
                className="inline-flex items-center rounded-lg bg-primary-light/35 dark:bg-primary/20 px-2.5 py-1 text-[11px] font-bold text-primary"
              >
                {imp}
              </span>
            ))}
          </div>
        )}

        {/* View Mode Layouts */}
        {viewMode === 'diff' ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
              <h3 className="text-body-sm font-bold text-text-secondary flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                <span>Text Diff View</span>
              </h3>
              <DiffViewer original={rewrite.originalContent} revised={rewrite.rewrittenContent} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Card */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col h-full">
              <h3 className="text-body-sm font-bold text-text-muted flex items-center gap-2 mb-4">
                <FileText className="h-4.5 w-4.5" />
                <span>Original Section Text</span>
              </h3>
              <div className="flex-1 font-mono text-body-sm text-text-secondary leading-relaxed bg-surface-alt/15 p-4 rounded-xl border border-border/50 max-h-[350px] overflow-y-auto whitespace-pre-wrap">
                {rewrite.originalContent}
              </div>
            </div>

            {/* Improved Card */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-light/5 to-background dark:from-primary-light/5 dark:to-surface p-6 shadow-xs flex flex-col h-full">
              <h3 className="text-body-sm font-bold text-primary flex items-center gap-2 mb-4">
                <Sparkles className="h-4.5 w-4.5 fill-primary" />
                <span>AI Rewritten Text</span>
              </h3>
              <div className="flex-1 font-mono text-body-sm text-text-primary leading-relaxed bg-surface border border-border p-4 rounded-xl max-h-[350px] overflow-y-auto whitespace-pre-wrap">
                {rewrite.rewrittenContent}
              </div>
            </div>
          </div>
        )}

        {/* Accept/Reject Control Bar */}
        {rewrite.status === 'Pending' ? (
          <div className="flex justify-between items-center bg-surface border border-border p-5 rounded-2xl shadow-xs">
            <div className="hidden sm:block">
              <p className="text-body-sm font-bold text-text-primary">Ready to commit changes?</p>
              <p className="text-caption text-text-secondary">
                Accepting will save this as a new resume version.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                variant="secondary"
                onClick={handleReject}
                disabled={actioning}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2"
              >
                <X className="h-4 w-4" />
                <span>Reject Changes</span>
              </Button>
              <Button
                variant="primary"
                onClick={handleAccept}
                disabled={actioning}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 font-bold"
              >
                <Check className="h-4 w-4" />
                <span>Accept & Save Version</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Already committed notification bar */
          <div className={`rounded-2xl border p-5 flex items-center gap-3.5 shadow-xs ${
            rewrite.status === 'Accepted'
              ? 'border-success/20 bg-success/5 text-success'
              : 'border-danger/20 bg-danger/5 text-danger'
          }`}>
            <ShieldAlert className="h-6 w-6 shrink-0" />
            <div>
              <p className="text-body-sm font-bold">Rewrite Status: {rewrite.status}</p>
              <p className="text-caption opacity-80 mt-0.5">
                {rewrite.status === 'Accepted'
                  ? 'This version has been approved and saved to your history.'
                  : 'This rewrite revision has been discarded.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default RewriteComparisonPage;
