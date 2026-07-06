import React from 'react';
import DashboardCard from './DashboardCard';

/**
 * StatsCard — Individual stats widget card.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const StatsCard = ({ icon: Icon, title, value, description, className = '' }) => (
  <DashboardCard className={`flex flex-col justify-between min-h-[140px] ${className}`}>
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{title}</span>
      {Icon && (
        <div className="rounded-lg bg-primary-light p-2 text-primary dark:bg-primary-light/10">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      )}
    </div>
    <div className="mt-3">
      <div className="text-2xl font-black text-text-primary tracking-tight">{value}</div>
      {description && <p className="text-caption text-text-muted mt-1 font-medium">{description}</p>}
    </div>
  </DashboardCard>
);

export default StatsCard;
