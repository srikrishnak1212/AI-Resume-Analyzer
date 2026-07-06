import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Sparkles } from 'lucide-react';
import DashboardCard from '../dashboard/DashboardCard';

/**
 * DeltaBadge — Renders delta changes styled green/red/gray.
 */
const DeltaBadge = ({ value }) => {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-success-light px-2 py-0.5 text-[10px] font-bold text-success dark:bg-success-light/10">
        <ArrowUpRight className="h-3 w-3" />
        <span>+{value}</span>
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-danger-light px-2 py-0.5 text-[10px] font-bold text-danger dark:bg-danger-light/10">
        <ArrowDownRight className="h-3 w-3" />
        <span>{value}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-surface-alt px-2 py-0.5 text-[10px] font-bold text-text-muted">
      <Minus className="h-2.5 w-2.5" />
      <span>0</span>
    </span>
  );
};

/**
 * ResumeComparison — Side-by-side version comparison page widget.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const ResumeComparison = ({ comparisonData, isLoading = false, className = '' }) => {
  if (isLoading) {
    return (
      <DashboardCard title="Resume Version Comparison" subtitle="Comparing scores across versions" className={className}>
        <div className="flex items-center justify-center py-12 animate-pulse">
          <p className="text-caption text-text-muted">Loading version comparison...</p>
        </div>
      </DashboardCard>
    );
  }

  if (!comparisonData || !comparisonData.current) {
    return (
      <DashboardCard title="Resume Version Comparison" className={className}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-body-sm text-text-muted">No comparison data available.</p>
        </div>
      </DashboardCard>
    );
  }

  const { current, previous, deltas, improvements = [] } = comparisonData;

  const rows = [
    { label: 'Overall Score', key: 'overallScore' },
    { label: 'ATS Score', key: 'atsScore' },
    { label: 'Grammar Score', key: 'grammarScore' },
    { label: 'Formatting Score', key: 'formattingScore' },
    { label: 'Skills Score', key: 'skillsScore' },
    { label: 'Projects Score', key: 'projectsScore' },
    { label: 'Experience Score', key: 'experienceScore' },
    { label: 'Education Score', key: 'educationScore' }
  ];

  return (
    <DashboardCard
      title="Resume Version Comparison"
      subtitle={`Comparing Current (${current.fileName} v${current.versionNumber}) vs ${previous ? `${previous.fileName} v${previous.versionNumber}` : 'Baseline'}`}
      className={className}
    >
      <div className="space-y-6">
        {/* Aggregated improvements checklist */}
        {improvements.length > 0 && (
          <div className="rounded-xl bg-primary-light/30 border border-primary-light/40 p-4 dark:bg-primary-light/10">
            <div className="flex items-center gap-2 mb-2 text-primary font-bold text-body-sm">
              <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              <span>AI Version Highlights</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-caption text-text-secondary leading-relaxed font-semibold">
              {improvements.map((imp, idx) => (
                <li key={idx}>{imp}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Side-by-side comparison tables */}
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full border-collapse text-left text-body-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-border">
                <th className="p-4.5 font-bold text-text-primary">Metric Dimension</th>
                <th className="p-4.5 font-bold text-text-primary text-center">Previous Score</th>
                <th className="p-4.5 font-bold text-text-primary text-center">Current Score</th>
                <th className="p-4.5 font-bold text-text-primary text-center">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                const curVal = current[row.key];
                const prevVal = previous ? previous[row.key] : null;
                const deltaVal = deltas[row.key];

                return (
                  <tr key={row.key} className="hover:bg-surface-alt/40 transition-colors">
                    <td className="p-4.5 font-semibold text-text-primary">{row.label}</td>
                    <td className="p-4.5 text-text-secondary text-center font-medium">
                      {prevVal !== null ? `${prevVal}/100` : '—'}
                    </td>
                    <td className="p-4.5 text-text-primary text-center font-bold">
                      {curVal}/100
                    </td>
                    <td className="p-4.5 text-center">
                      <DeltaBadge value={deltaVal} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardCard>
  );
};

export default ResumeComparison;
export { DeltaBadge };
