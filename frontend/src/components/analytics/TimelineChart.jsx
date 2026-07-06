import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';
import ChartCard from './ChartCard';

const CustomTimelineTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-surface p-3 shadow-md text-caption">
        <p className="font-bold text-text-primary">{data.fileName}</p>
        <p className="text-text-secondary mt-0.5">Version: {data.versionNumber}</p>
        <div className="mt-1.5 space-y-0.5 border-t border-border pt-1.5 font-bold">
          <p className="text-primary">Overall Score: {data.overallScore}/100</p>
          <p className="text-success">ATS Score: {data.atsScore}/100</p>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * TimelineChart — Recharts line plots for version scores progression over time.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const TimelineChart = ({ trends = [], isLoading = false, className = '' }) => {
  const isEmpty = !trends || trends.length === 0;

  // Format labels: "V1", "V2"
  const formattedData = trends.map(item => ({
    ...item,
    displayName: `v${item.versionNumber}`
  }));

  return (
    <ChartCard
      title="Resume Improvement Timeline"
      subtitle="Scores progression across uploaded resume versions"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="Upload more versions to visualize score trends."
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />
          <XAxis
            dataKey="displayName"
            tick={{ fill: 'var(--color-text-secondary, #4A5568)', fontSize: 10, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'var(--color-text-muted, #718096)', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTimelineTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, fontWeight: 600, fill: 'var(--color-text-primary)' }}
          />
          <Line
            name="Overall Score"
            type="monotone"
            dataKey="overallScore"
            stroke="var(--color-primary, #4F46E5)"
            strokeWidth={3}
            activeDot={{ r: 6 }}
            dot={{ r: 4 }}
          />
          <Line
            name="ATS Score"
            type="monotone"
            dataKey="atsScore"
            stroke="var(--color-success, #10B981)"
            strokeWidth={2}
            strokeDasharray="4 4"
            activeDot={{ r: 6 }}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TimelineChart;
export { CustomTimelineTooltip };
