import React from 'react';
import { Eye, Download, FileJson, Trash2, Calendar, HardDrive, Shield } from 'lucide-react';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatDate';

/**
 * ReportHistoryTable — Paginated list of completed reports with desktop table and mobile cards layouts.
 *
 * Reference: UI-Guide.md §7.14
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const ReportHistoryTable = ({
  reports = [],
  pagination = {},
  onPageChange,
  onView,
  onDownloadPDF,
  onDownloadJSON,
  onDelete,
}) => {
  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-xs flex flex-col justify-center items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light/30 text-primary mb-4">
          <HardDrive className="h-6 w-6" />
        </div>
        <h3 className="text-body font-bold text-text-primary mb-1">No reports generated yet</h3>
        <p className="text-body-sm text-text-muted max-w-sm mb-4 leading-relaxed">
          Reports are automatically generated when you view the results of a completed resume analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
        <table className="w-full border-collapse text-left text-body-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt font-bold text-text-secondary">
              <th className="px-5 py-3.5 uppercase tracking-wide text-[10px]">Report Details / Resume</th>
              <th className="px-5 py-3.5 uppercase tracking-wide text-[10px] text-center">Version</th>
              <th className="px-5 py-3.5 uppercase tracking-wide text-[10px] text-center">Overall Score</th>
              <th className="px-5 py-3.5 uppercase tracking-wide text-[10px] text-center">ATS Score</th>
              <th className="px-5 py-3.5 uppercase tracking-wide text-[10px]">Generated Date</th>
              <th className="px-5 py-3.5 uppercase tracking-wide text-[10px] text-center">Downloads</th>
              <th className="px-5 py-3.5 uppercase tracking-wide text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-semibold text-text-primary">
            {reports.map((report) => (
              <tr key={report.reportId} className="hover:bg-surface-alt/50 transition-colors">
                <td className="px-5 py-4">
                  <span className="font-bold text-text-primary block truncate max-w-[240px]" title={report.resumeName}>
                    {report.resumeName}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="inline-block rounded-md bg-surface-alt px-2 py-0.5 text-caption font-bold border border-border">
                    v{report.version}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {report.overallScore}/100
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="font-extrabold text-primary">
                    {report.atsScore}/100
                  </span>
                </td>
                <td className="px-5 py-4 text-text-secondary font-medium">
                  {formatDate(report.generatedAt)}
                </td>
                <td className="px-5 py-4 text-center text-text-secondary font-medium">
                  {report.downloadCount || 0}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onView(report.reportId)}
                      title="View Report"
                      className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/5"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onDownloadPDF(report.reportId)}
                      title="Download PDF"
                      className="p-1.5 rounded-lg text-text-secondary hover:text-emerald-500 hover:bg-emerald-500/5"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onDownloadJSON(report.reportId)}
                      title="Download JSON"
                      className="p-1.5 rounded-lg text-text-secondary hover:text-indigo-500 hover:bg-indigo-500/5"
                    >
                      <FileJson className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onDelete(report)}
                      title="Delete Report"
                      className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-500/5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {reports.map((report) => (
          <div key={report.reportId} className="rounded-2xl border border-border bg-surface p-4 shadow-xs space-y-3.5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-text-primary break-all pr-4">
                  {report.resumeName}
                </h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="rounded-md bg-surface-alt px-2 py-0.5 text-[10px] font-bold border border-border">
                    v{report.version}
                  </span>
                  <span className="text-[10px] font-bold text-text-secondary flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(report.generatedAt)}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wide">
                  Overall Score
                </span>
                <span className="text-body font-black text-emerald-600 dark:text-emerald-400">
                  {report.overallScore}/100
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-caption font-bold text-text-muted">
                Downloads: <strong className="text-text-secondary">{report.downloadCount || 0}</strong>
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onView(report.reportId)}
                  className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/5"
                >
                  <Eye className="h-4.5 w-4.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onDownloadPDF(report.reportId)}
                  className="p-2 rounded-lg text-text-secondary hover:text-emerald-500 hover:bg-emerald-500/5"
                >
                  <Download className="h-4.5 w-4.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onDownloadJSON(report.reportId)}
                  className="p-2 rounded-lg text-text-secondary hover:text-indigo-500 hover:bg-indigo-500/5"
                >
                  <FileJson className="h-4.5 w-4.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onDelete(report)}
                  className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-500/5"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-caption font-semibold text-text-muted">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} reports)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="py-1 px-3.5 rounded-lg text-caption font-bold"
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="py-1 px-3.5 rounded-lg text-caption font-bold"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportHistoryTable;
