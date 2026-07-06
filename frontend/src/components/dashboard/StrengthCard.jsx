import React from 'react';
import { Check } from 'lucide-react';

/**
 * StrengthCard — Lists key strengths identified in the resume.
 *
 * Reference: UI-Guide.md §7.7
 */
const StrengthCard = ({ strengths = [] }) => {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-text-primary flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success-light text-success text-xs">✓</span>
        Identified Strengths
      </h3>
      {strengths.length > 0 ? (
        <ul className="space-y-3">
          {strengths.map((str, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
              <Check className="h-4.5 w-4.5 text-success shrink-0 mt-0.5" />
              <span>{str}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-muted">No strengths lists evaluated.</p>
      )}
    </div>
  );
};

export default StrengthCard;
