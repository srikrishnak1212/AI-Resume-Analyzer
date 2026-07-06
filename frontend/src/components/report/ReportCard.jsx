import React from 'react';
import { Eye, Download, FileJson, Trash2, Calendar, FileText } from 'lucide-react';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatDate';

/**
 * ReportCard — Renders individual report summary and action triggers.
 *
 * Reference: UI-Guide.md §8, §7.14
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const ReportCard = ({
  report = {},
  onView,
  onDownloadPDF,
  onDownloadJSON,
  onDelete,
}) => {
  const resumeName = report.resumeName || 'Resume';
  const score = report.overallScore || 0;
  const date = report.generatedAt;

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs transition-all duration-150 hover:shadow-md hover:border-primary/20 flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-primary bg-primary-light dark:bg-primary-light/10 px-2 py-0.5 rounded-md uppercase tracking-wider mb-2 inline-block">
            Version {report.version}
          </span>
          <h4 className="text-body-sm font-bold text-text-primary truncate max-w-[200px]" title={resumeName}>
            {resumeName}
          </h4>
          <div className="flex flex-col gap-1.5 mt-2.5 text-text-muted text-caption font-semibold">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>Downloads: <span className="text-text-secondary">{report.downloadCount || 0}</span></span>
            </div>
          </div>
        </div>

        {/* ATS Score Dial */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative flex items-center justify-center h-12 w-12 rounded-full border-[3px] border-emerald-500/10 bg-emerald-500/5">
            <span className="text-caption font-black text-emerald-600 dark:text-emerald-400">
              {score}
            </span>
          </div>
          <span className="text-[9px] font-bold text-text-muted mt-1 uppercase tracking-wide">
            Score
          </span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-end gap-1.5 border-t border-border pt-3.5">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onView(report.reportId)}
          title="View Report"
          className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/5"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onDownloadPDF(report.reportId)}
          title="Download PDF"
          className="p-2 rounded-lg text-text-secondary hover:text-emerald-500 hover:bg-emerald-500/5"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onDownloadJSON(report.reportId)}
          title="Download JSON"
          className="p-2 rounded-lg text-text-secondary hover:text-indigo-500 hover:bg-indigo-500/5"
        >
          <FileJson className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onDelete(report)}
          title="Delete Report"
          className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-500/5"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ReportCard;
