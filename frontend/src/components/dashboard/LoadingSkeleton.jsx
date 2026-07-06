import React from 'react';
import CommonSkeleton from '../common/LoadingSkeleton';

/**
 * DashboardSkeleton — Shimmer layout specifically structured for the main dashboard view.
 * Reuses the low-level stats, table, and card skeletons.
 *
 * Reference: UI-Guide.md §6.13, §6.3
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Stats row grid */}
      <CommonSkeleton type="stats" />

      {/* Main dashboard body grid layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left main area columns (Resumes & Actions) */}
        <div className="lg:col-span-2 space-y-6">
          <CommonSkeleton type="card" />
          <CommonSkeleton type="card" />
        </div>

        {/* Right side panels (Profile & Notifications) */}
        <div className="space-y-6">
          <CommonSkeleton type="card" />
          <CommonSkeleton type="card" />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
