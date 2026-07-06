import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ChartCard from './ChartCard';
import { SCORE_THRESHOLDS } from '../../utils/constants';

/**
 * ATSGauge — Speedometer dial gauge for overall ATS Score.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const ATSGauge = ({ score = 0, isLoading = false, className = '' }) => {
  const parsedScore = Math.max(0, Math.min(100, Math.round(Number(score)) || 0));

  // Determine score color matching constants
  let color = '#EF4444'; // Danger red
  if (parsedScore >= SCORE_THRESHOLDS.SUCCESS_MIN) {
    color = '#10B981'; // Success green
  } else if (parsedScore > SCORE_THRESHOLDS.DANGER_MAX) {
    color = '#F59E0B'; // Warning amber
  }

  // Speedometer data format
  const data = [
    { value: parsedScore },
    { value: 100 - parsedScore }
  ];

  return (
    <ChartCard
      title="Overall ATS Score"
      subtitle="ATS compatibility evaluation level"
      isLoading={isLoading}
      className={className}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-full h-[180px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="90%"
                startAngle={180}
                endAngle={0}
                innerRadius={65}
                outerRadius={85}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={color} />
                <Cell fill="var(--color-bg-alt, #E2E8F0)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Absolute labels overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-3 text-center">
            <span className="text-3xl font-black text-text-primary tracking-tight">
              {parsedScore}
            </span>
            <span className="text-caption font-bold text-text-muted uppercase tracking-wider mt-0.5">
              Score
            </span>
          </div>
        </div>

        {/* Speedometer legend indicators */}
        <div className="mt-4 flex items-center justify-center gap-6 text-caption font-semibold text-text-secondary">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger" />
            <span>0-49 Poor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-warning" />
            <span>50-74 Good</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            <span>75-100 Great</span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
};

export default ATSGauge;
