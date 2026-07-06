import React from 'react';

/**
 * LoadingSkeleton — Animated shimmer loaders.
 * Supports stats grid, card breakdown, table rows, and text layout skeletons.
 *
 * Reference: UI-Guide.md §6.13, §6.3
 */
const LoadingSkeleton = ({ type = 'analysis', count = 1 }) => {
  // Stats boxes loader
  const renderStats = () => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="h-4 w-1/2 rounded bg-surface-alt mb-3" />
          <div className="h-8 w-1/3 rounded bg-surface-alt" />
        </div>
      ))}
    </div>
  );

  // Resume page sections loader
  const renderAnalysis = () => (
    <div className="space-y-6">
      {/* Hero row skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="animate-pulse rounded-lg border border-border bg-surface p-6 shadow-sm md:col-span-1 flex flex-col items-center justify-center">
          <div className="h-28 w-28 rounded-full bg-surface-alt mb-4" />
          <div className="h-4 w-1/3 rounded bg-surface-alt" />
        </div>
        <div className="animate-pulse rounded-lg border border-border bg-surface p-6 shadow-sm md:col-span-2 space-y-4">
          <div className="h-6 w-1/4 rounded bg-surface-alt" />
          <div className="h-4 w-full rounded bg-surface-alt" />
          <div className="h-4 w-5/6 rounded bg-surface-alt" />
          <div className="h-4 w-3/4 rounded bg-surface-alt" />
        </div>
      </div>

      {/* Charts row skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="animate-pulse h-80 rounded-lg border border-border bg-surface p-5 shadow-sm" />
        <div className="animate-pulse h-80 rounded-lg border border-border bg-surface p-5 shadow-sm" />
      </div>

      {/* Tabs detail skeleton */}
      <div className="animate-pulse rounded-lg border border-border bg-surface p-6 shadow-sm space-y-4">
        <div className="h-6 w-1/5 rounded bg-surface-alt" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-surface-alt" />
          <div className="h-4 w-11/12 rounded bg-surface-alt" />
          <div className="h-4 w-4/5 rounded bg-surface-alt" />
        </div>
      </div>
    </div>
  );

  // General single card loader
  const renderCard = () => (
    <div className="animate-pulse rounded-lg border border-border bg-surface p-5 shadow-sm space-y-3">
      <div className="h-5 w-1/3 rounded bg-surface-alt" />
      <div className="h-4 w-full rounded bg-surface-alt" />
      <div className="h-4 w-5/6 rounded bg-surface-alt" />
    </div>
  );

  // Table rows loader
  const renderTable = () => (
    <div className="border border-border rounded-lg overflow-hidden bg-surface shadow-sm">
      <div className="h-12 bg-surface-alt animate-pulse border-b border-border" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 border-b border-border flex items-center px-6 justify-between animate-pulse">
          <div className="h-4 w-1/4 rounded bg-surface-alt" />
          <div className="h-4 w-1/6 rounded bg-surface-alt" />
          <div className="h-4 w-12 rounded-full bg-surface-alt" />
        </div>
      ))}
    </div>
  );

  if (type === 'stats') return renderStats();
  if (type === 'card') return renderCard();
  if (type === 'table') return renderTable();
  return renderAnalysis();
};

export default LoadingSkeleton;
