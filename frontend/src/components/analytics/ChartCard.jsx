import React from 'react';
import DashboardCard from '../dashboard/DashboardCard';

/**
 * ChartCard — Standard card layout to enclose charts.
 * Displays loading skeletons and empty datasets states helper blocks.
 *
 * Reference: UI-Guide.md §6.13, §8
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const ChartCard = ({
  title,
  subtitle,
  children,
  isLoading = false,
  isEmpty = false,
  emptyText = 'No data available to display.',
  className = '',
}) => {
  return (
    <DashboardCard title={title} subtitle={subtitle} className={`flex flex-col h-full min-h-[360px] ${className}`}>
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p className="text-caption text-text-muted">Loading chart data...</p>
          </div>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <p className="text-body-sm text-text-muted font-medium">{emptyText}</p>
        </div>
      ) : (
        <div className="flex-1 w-full mt-2 relative min-h-[260px]">
          {children}
        </div>
      )}
    </DashboardCard>
  );
};

export default ChartCard;
