import React from 'react';
import { Target, AlertTriangle } from 'lucide-react';

/**
 * KeywordCard — Renders present vs missing ATS keywords.
 *
 * Reference: UI-Guide.md §7.7, AI-Prompts.md §3
 */
const KeywordCard = ({ atsAnalysis }) => {
  if (!atsAnalysis) return null;

  const { keywordsFound = [], keywordsMissing = [] } = atsAnalysis;

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-bold text-text-primary flex items-center gap-2">
        <Target className="h-5 w-5 text-secondary" />
        ATS Keyword Optimization
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Keywords Found */}
        <div className="border border-border/50 rounded-lg p-4 bg-background/30">
          <h4 className="mb-3 text-sm font-semibold text-text-secondary flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            Keywords Found ({keywordsFound.length})
          </h4>
          {keywordsFound.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {keywordsFound.map((kw, idx) => (
                <span
                  key={idx}
                  className="rounded bg-surface-alt px-2.5 py-1 text-xs font-semibold text-text-secondary border border-border"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">No keywords matched.</p>
          )}
        </div>

        {/* Keywords Missing */}
        <div className="border border-border/50 rounded-lg p-4 bg-background/30">
          <h4 className="mb-3 text-sm font-semibold text-text-secondary flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-danger" />
            Recommended / Missing Keywords ({keywordsMissing.length})
          </h4>
          {keywordsMissing.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {keywordsMissing.map((kw, idx) => (
                <span
                  key={idx}
                  className="rounded bg-danger-light px-2.5 py-1 text-xs font-semibold text-danger border border-danger/10"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">Excellent keyword density! None missing.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeywordCard;
