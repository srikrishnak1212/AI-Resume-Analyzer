import React from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';
import DashboardCard from '../dashboard/DashboardCard';
import Button from '../common/Button';

/**
 * HistoryTable — Paginated log list of analysis runs.
 *
 * Reference: UI-Guide.md §6.4 (Tables), §8
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const HistoryTable = ({
  analyses = [],
  pagination = {},
  onPageChange,
  onViewClick,
  isLoading = false,
  className = '',
}) => {
  const { page = 1, totalPages = 1, total = 0 } = pagination;

  return (
    <DashboardCard
      title="Analysis History"
      subtitle="Complete ledger of all evaluation runs"
      className={className}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16 animate-pulse">
          <p className="text-caption text-text-muted">Loading history details...</p>
        </div>
      ) : analyses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-body-sm text-text-muted">No analysis records match the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full border-collapse text-left text-body-sm">
              <thead>
                <tr className="bg-surface-alt border-b border-border">
                  <th className="p-4 font-bold text-text-primary">File Name</th>
                  <th className="p-4 font-bold text-text-primary text-center">Version</th>
                  <th className="p-4 font-bold text-text-primary text-center">ATS Score</th>
                  <th className="p-4 font-bold text-text-primary text-center">Model Used</th>
                  <th className="p-4 font-bold text-text-primary text-center">Duration</th>
                  <th className="p-4 font-bold text-text-primary">Analysis Date</th>
                  <th className="p-4 font-bold text-text-primary text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analyses.map((item) => (
                  <tr key={item.analysisId} className="hover:bg-surface-alt/40 transition-colors">
                    <td className="p-4 font-semibold text-text-primary truncate max-w-[180px] sm:max-w-xs" title={item.fileName}>
                      {item.fileName}
                    </td>
                    <td className="p-4 text-center font-bold text-text-secondary">v{item.versionNumber}</td>
                    <td className="p-4 text-center font-black text-primary">{item.atsScore}/100</td>
                    <td className="p-4 text-center text-text-secondary font-medium">{item.aiModel}</td>
                    <td className="p-4 text-center text-text-muted font-medium">
                      {(item.analysisDuration / 1000).toFixed(1)}s
                    </td>
                    <td className="p-4 text-text-muted font-medium">
                      {formatDateTime(item.analysisDate)}
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewClick(item.resumeId)}
                        className="p-1.5 text-primary hover:bg-primary-light/50 rounded-lg inline-flex items-center gap-1.5"
                        title="View detailed scorecard"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline-block font-semibold">View</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-caption text-text-secondary">
                Page <span className="font-bold text-text-primary">{page}</span> of{' '}
                <span className="font-bold text-text-primary">{totalPages}</span> ({total} runs)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                  className="p-2.5 rounded-lg border border-border shadow-xs disabled:opacity-40"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                  className="p-2.5 rounded-lg border border-border shadow-xs disabled:opacity-40"
                  aria-label="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
};

export default HistoryTable;
