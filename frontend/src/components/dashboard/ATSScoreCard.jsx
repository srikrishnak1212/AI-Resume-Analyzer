import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

/**
 * ATSScoreCard — Renders Passed Checks, Failed Checks, and Format Warnings.
 *
 * Reference: UI-Guide.md §7.7, AI-Prompts.md §3
 */
const ATSScoreCard = ({ atsAnalysis }) => {
  if (!atsAnalysis) return null;

  const { passedChecks = [], failedChecks = [], formatWarnings = [] } = atsAnalysis;

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-text-primary">
        <Info className="h-5 w-5 text-primary" />
        ATS Parseability Checks
      </h3>

      <div className="space-y-6">
        {/* Passed Checks */}
        {passedChecks.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-success flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Passed Checks ({passedChecks.length})
            </h4>
            <ul className="space-y-1.5 pl-6 list-disc text-sm text-text-secondary">
              {passedChecks.map((check, idx) => (
                <li key={idx}>{check}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Failed Checks */}
        {failedChecks.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-danger flex items-center gap-1.5">
              <XCircle className="h-4 w-4" />
              Critiques / Failed Checks ({failedChecks.length})
            </h4>
            <ul className="space-y-1.5 pl-6 list-disc text-sm text-text-secondary">
              {failedChecks.map((check, idx) => (
                <li key={idx}>{check}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Format Warnings */}
        {formatWarnings.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-warning flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Formatting Warnings ({formatWarnings.length})
            </h4>
            <ul className="space-y-1.5 pl-6 list-disc text-sm text-text-secondary">
              {formatWarnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {passedChecks.length === 0 && failedChecks.length === 0 && formatWarnings.length === 0 && (
          <p className="text-sm text-text-muted">No parseability data evaluated.</p>
        )}
      </div>
    </div>
  );
};

export default ATSScoreCard;
