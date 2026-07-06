import React from 'react';
import { Target, AlertCircle } from 'lucide-react';

/**
 * KeywordComparison — Visualizes ATS keyword overlap results.
 */
const KeywordComparison = ({ matchedKeywords = [], missingKeywords = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Matched Keywords */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4 text-text-primary">
          <Target className="h-5 w-5 text-primary shrink-0" />
          <h3 className="text-body font-bold">Identified Keywords ({matchedKeywords.length})</h3>
        </div>
        {matchedKeywords.length === 0 ? (
          <p className="text-body-sm text-text-muted italic">No matching keywords found.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {matchedKeywords.map((kw, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-lg bg-surface-alt px-3 py-1 text-body-sm font-medium text-text-primary border border-border"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Missing Keywords */}
      <div className="rounded-2xl border border-warning/20 bg-warning/5 dark:bg-warning/10 p-6 shadow-xs flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4 text-warning">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <h3 className="text-body font-bold">Missing Keywords ({missingKeywords.length})</h3>
        </div>
        {missingKeywords.length === 0 ? (
          <p className="text-body-sm text-success font-semibold italic">Keyword list complete.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((kw, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-lg bg-warning-light dark:bg-warning/20 px-3 py-1 text-body-sm font-semibold text-warning"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordComparison;
