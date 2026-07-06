import React from 'react';

/**
 * DashboardCard — Reusable card wrapper with header titles, subtitles, and action blocks.
 *
 * Reference: UI-Guide.md §5 (Grid/Layout), §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const DashboardCard = ({ children, className = '', title = '', subtitle = '', headerAction = null }) => (
  <div className={`rounded-xl border border-border bg-surface p-5 shadow-xs hover:shadow-sm transition-shadow duration-150 ${className}`}>
    {(title || subtitle || headerAction) && (
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          {title && <h4 className="text-body-lg font-bold text-text-primary tracking-tight">{title}</h4>}
          {subtitle && <p className="text-caption text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>
    )}
    {children}
  </div>
);

export default DashboardCard;
