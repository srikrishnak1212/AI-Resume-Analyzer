import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

/**
 * AnalysisCharts — Displays radar and bar chart breakdown of the scoring metrics.
 *
 * Reference: UI-Guide.md §6.8, §2.3
 */
const AnalysisCharts = ({ analysis }) => {
  if (!analysis) return null;

  // Prepare data for the charts
  const data = [
    { name: 'ATS Match', Score: analysis.atsScore, fullMark: 100 },
    { name: 'Grammar', Score: analysis.grammarScore, fullMark: 100 },
    { name: 'Formatting', Score: analysis.formattingScore, fullMark: 100 },
    { name: 'Skills', Score: analysis.skillsScore, fullMark: 100 },
    { name: 'Experience', Score: analysis.experienceScore, fullMark: 100 },
    { name: 'Education', Score: analysis.educationScore, fullMark: 100 },
    { name: 'Projects', Score: analysis.projectsScore, fullMark: 100 },
    { name: 'Summary', Score: analysis.summaryScore, fullMark: 100 },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Radar Chart Card */}
      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
          Score Radar Breakdown
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: 'var(--color-text-muted)' }}
              />
              <Radar
                name="Score"
                dataKey="Score"
                stroke="var(--color-primary)"
                fill="var(--color-primary)"
                fillOpacity={0.25}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                  borderRadius: '10px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart Card */}
      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
          Dimension Scores Comparison
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                  borderRadius: '10px',
                }}
                cursor={{ fill: 'var(--color-surface-alt)', opacity: 0.4 }}
              />
              <Bar
                dataKey="Score"
                fill="var(--color-secondary)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCharts;
