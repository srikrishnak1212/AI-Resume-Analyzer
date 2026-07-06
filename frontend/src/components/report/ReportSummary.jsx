import React from 'react';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

/**
 * ReportSummary — Summary metrics cards and AI summary text.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const ReportSummary = ({ summary = '', atsScore = 0, overallScore = 0 }) => {
  const getHealth = (score) => {
    if (score >= 75) return { label: 'Excellent', color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20' };
    if (score >= 50) return { label: 'Good', color: 'text-amber-500 bg-amber-500/5 border-amber-500/20' };
    return { label: 'Needs Improvement', color: 'text-red-500 bg-red-500/5 border-red-500/20' };
  };

  const health = getHealth(overallScore);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* ATS Score */}
        <div className="rounded-2xl border border-border bg-surface p-5 text-center flex flex-col justify-center items-center shadow-xs">
          <ShieldCheck className="h-6 w-6 text-primary mb-2" />
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
            ATS Score
          </span>
          <span className="text-h1 font-black text-primary">
            {atsScore}
            <span className="text-body-sm font-normal text-text-muted">/100</span>
          </span>
        </div>

        {/* Overall Score */}
        <div className="rounded-2xl border border-border bg-surface p-5 text-center flex flex-col justify-center items-center shadow-xs">
          <Heart className="h-6 w-6 text-emerald-500 mb-2" />
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
            Overall Rating
          </span>
          <span className="text-h1 font-black text-emerald-500">
            {overallScore}
            <span className="text-body-sm font-normal text-text-muted">/100</span>
          </span>
        </div>

        {/* Health */}
        <div className={`rounded-2xl border p-5 text-center flex flex-col justify-center items-center shadow-xs ${health.color}`}>
          <Sparkles className="h-6 w-6 mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">
            Resume Health
          </span>
          <span className="text-h3 font-black">
            {health.label}
          </span>
        </div>
      </div>

      {/* AI Summary Box */}
      <div className="rounded-2xl border border-border bg-surface-alt p-5 shadow-xs">
        <h3 className="text-body-sm font-bold text-text-primary uppercase tracking-wide mb-2">
          AI Summary Insight
        </h3>
        <p className="text-body-sm text-text-secondary leading-relaxed text-justify">
          {summary || 'No summary overview provided.'}
        </p>
      </div>
    </div>
  );
};

export default ReportSummary;
