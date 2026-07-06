import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from 'recharts';
import ChartCard from './ChartCard';
import { SCORE_THRESHOLDS } from '../../utils/constants';

/**
 * CustomTooltip — Premium floating helper for chart values.
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-surface p-3 shadow-md text-caption">
        <p className="font-bold text-text-primary">{payload[0].payload.name}</p>
        <p className="text-primary font-black mt-0.5">Score: {payload[0].value}/100</p>
      </div>
    );
  }
  return null;
};

/**
 * ScoreBarChart — Recharts bar plots for resume subcomponents score comparisons.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const ScoreBarChart = ({ summaryData, isLoading = false, className = '' }) => {
  const isEmpty = !summaryData;

  // Format data for chart
  const data = summaryData ? [
    { name: 'ATS', value: summaryData.avgAtsScore },
    { name: 'Grammar', value: summaryData.avgGrammarScore },
    { name: 'Formatting', value: summaryData.avgFormattingScore },
    { name: 'Skills', value: summaryData.avgSkillsScore },
    { name: 'Projects', value: summaryData.avgProjectsScore },
    { name: 'Experience', value: summaryData.avgExperienceScore },
    { name: 'Education', value: summaryData.avgEducationScore }
  ] : [];

  const getBarColor = (score) => {
    if (score >= SCORE_THRESHOLDS.SUCCESS_MIN) return 'var(--color-success, #10B981)';
    if (score > SCORE_THRESHOLDS.DANGER_MAX) return 'var(--color-warning, #F59E0B)';
    return 'var(--color-danger, #EF4444)';
  };

  return (
    <ChartCard
      title="Dimension Comparison"
      subtitle="Average scores breakdown across sections"
      isLoading={isLoading}
      isEmpty={isEmpty}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />
          <XAxis
            dataKey="name"
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-bg-alt, #F7FAFC)', opacity: 0.5 }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={32}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ScoreBarChart;
