import React from 'react';
import { AlertOctagon } from 'lucide-react';

/**
 * WeaknessCard — Lists key critique areas/weaknesses identified in the resume.
 *
 * Reference: UI-Guide.md §7.7
 */
const WeaknessCard = ({ weaknesses = [] }) => {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-text-primary flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-danger-light text-danger text-xs">!</span>
        Areas for Improvement
      </h3>
      {weaknesses.length > 0 ? (
        <ul className="space-y-3">
          {weaknesses.map((weak, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
              <AlertOctagon className="h-4.5 w-4.5 text-danger shrink-0 mt-0.5" />
              <span>{weak}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-muted">No critique areas evaluated.</p>
      )}
    </div>
  );
};

export default WeaknessCard;
