import React from 'react';
import ChartCard from './ChartCard';

/**
 * KeywordChart — Categorized grids display for keywords distribution.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const KeywordChart = ({
  detectedKeywords = [],
  missingKeywords = [],
  recommendedKeywords = [],
  isLoading = false,
  className = '',
}) => {
  const isEmpty =
    detectedKeywords.length === 0 &&
    missingKeywords.length === 0 &&
    recommendedKeywords.length === 0;

  return (
    <ChartCard
      title="Keyword Distribution"
      subtitle="Keywords found vs. missing for target role"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No keyword analysis results available."
      className={className}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Detected Keywords */}
        <div className="rounded-xl border border-border bg-surface-alt p-4">
          <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
            <span className="text-caption font-bold text-success uppercase">Found Keywords</span>
            <span className="rounded-full bg-success-light px-2 py-0.5 text-[10px] font-bold text-success dark:bg-success-light/10">
              {detectedKeywords.length}
            </span>
          </div>
          {detectedKeywords.length === 0 ? (
            <p className="text-caption text-text-muted mt-2">No matching keywords detected.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {detectedKeywords.map((word) => (
                <span
                  key={word}
                  className="rounded-lg bg-success-light/30 border border-success-light px-2 py-1 text-caption font-medium text-success dark:bg-success-light/10"
                >
                  {word}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Missing Keywords */}
        <div className="rounded-xl border border-border bg-surface-alt p-4">
          <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
            <span className="text-caption font-bold text-danger uppercase">Missing Keywords</span>
            <span className="rounded-full bg-danger-light px-2 py-0.5 text-[10px] font-bold text-danger dark:bg-danger-light/10">
              {missingKeywords.length}
            </span>
          </div>
          {missingKeywords.length === 0 ? (
            <p className="text-caption text-success mt-2 font-medium">Excellent! No critical missing keywords.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {missingKeywords.map((word) => (
                <span
                  key={word}
                  className="rounded-lg bg-danger-light/30 border border-danger-light px-2 py-1 text-caption font-medium text-danger dark:bg-danger-light/10"
                >
                  {word}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Keywords */}
        <div className="rounded-xl border border-border bg-surface-alt p-4">
          <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
            <span className="text-caption font-bold text-primary uppercase">Recommended Keywords</span>
            <span className="rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-bold text-primary dark:bg-primary-light/10">
              {recommendedKeywords.length}
            </span>
          </div>
          {recommendedKeywords.length === 0 ? (
            <p className="text-caption text-text-muted mt-2">No recommended keywords identified.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {recommendedKeywords.map((word) => (
                <span
                  key={word}
                  className="rounded-lg bg-primary-light/50 px-2 py-1 text-caption font-medium text-primary dark:bg-primary-light/10"
                >
                  {word}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </ChartCard>
  );
};

export default KeywordChart;
