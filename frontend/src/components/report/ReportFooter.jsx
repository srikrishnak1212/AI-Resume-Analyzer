import React from 'react';
import { Cpu, Bookmark, HelpCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

/**
 * ReportFooter — Information footer for report generation stats and models.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const ReportFooter = ({ report = {} }) => {
  const generatedAt = report.generatedAt || report.createdAt;
  const model = report.analysisId?.aiModel || 'gemini-1.5-pro';
  
  return (
    <div className="rounded-xl border border-border bg-surface-alt p-4">
      <div className="flex flex-wrap items-center justify-between gap-4 text-text-muted text-[11px] font-medium">
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5" />
          <span>Model: <span className="font-bold text-text-secondary">{model}</span></span>
        </div>

        <div className="flex items-center gap-1.5">
          <Bookmark className="h-3.5 w-3.5" />
          <span>Prompt: <span className="font-bold text-text-secondary">v1.0</span></span>
        </div>

        <div className="flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Schema: <span className="font-bold text-text-secondary">v1.0</span></span>
        </div>

        <div className="shrink-0 text-right">
          <span>Processed: <span className="font-bold text-text-secondary">{formatDate(generatedAt)}</span></span>
        </div>
      </div>
    </div>
  );
};

export default ReportFooter;
