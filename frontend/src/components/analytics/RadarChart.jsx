import React from 'react';
import {
  ResponsiveContainer,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import ChartCard from './ChartCard';

/**
 * RadarChart — Recharts polar plotting of derived skills dimensions.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const RadarChart = ({ data = [], isLoading = false, className = '' }) => {
  const isEmpty = !data || data.length === 0;

  return (
    <ChartCard
      title="Skills Dimension Analysis"
      subtitle="Soft and technical skills distribution radar"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No skills radar statistics available."
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ReRadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="var(--color-border, #E2E8F0)" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: 'var(--color-text-secondary, #4A5568)', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: 'var(--color-text-muted, #718096)', fontSize: 9 }}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="var(--color-primary, #4F46E5)"
            fill="var(--color-primary, #4F46E5)"
            fillOpacity={0.25}
          />
        </ReRadarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default RadarChart;
