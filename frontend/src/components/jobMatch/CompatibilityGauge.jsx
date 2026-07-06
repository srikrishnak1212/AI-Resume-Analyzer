import React from 'react';
import ScoreGauge from '../charts/ScoreGauge';

/**
 * CompatibilityGauge — Displays the overall job matching score in a circular dial.
 * Reuses the shared ScoreGauge component for visual consistency and DRY compliance.
 */
const CompatibilityGauge = ({ score = 0, label = 'Overall Match' }) => {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 flex flex-col items-center justify-center shadow-xs">
      <ScoreGauge score={score} size={150} strokeWidth={10} label={label} />
    </div>
  );
};

export default CompatibilityGauge;
