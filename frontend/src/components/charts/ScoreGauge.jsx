import React, { useEffect, useState } from 'react';
import { SCORE_THRESHOLDS } from '../../utils/constants';

/**
 * ScoreGauge — A premium circular SVG progress ring for score display.
 * Includes animate-on-load counting.
 *
 * Reference: UI-Guide.md §6.7, §2.3
 */
const ScoreGauge = ({ score = 0, size = 120, strokeWidth = 8, label = 'Overall' }) => {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    // Smooth counting animation up to the target score
    let start = 0;
    const duration = 800; // ms
    const stepTime = Math.abs(Math.floor(duration / (score || 1)));
    
    if (score === 0) {
      setCurrentScore(0);
      return;
    }

    const timer = setInterval(() => {
      start += 1;
      setCurrentScore(start);
      if (start >= score) {
        clearInterval(timer);
      }
    }, Math.max(stepTime, 8));

    return () => clearInterval(timer);
  }, [score]);

  // Determine score level color
  const getColorClass = (val) => {
    if (val <= SCORE_THRESHOLDS.DANGER_MAX) return 'text-danger stroke-danger';
    if (val <= SCORE_THRESHOLDS.WARNING_MAX) return 'text-warning stroke-warning';
    return 'text-success stroke-success';
  };

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="h-full w-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Base track */}
          <circle
            className="stroke-border"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            strokeWidth={strokeWidth}
          />
          {/* Filled progress track */}
          <circle
            className={`transition-all duration-300 ease-out ${getColorClass(score)}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Centered score number text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight text-text-primary">
            {currentScore}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            / 100
          </span>
        </div>
      </div>
      {label && (
        <span className="mt-3 text-sm font-semibold text-text-secondary">
          {label}
        </span>
      )}
    </div>
  );
};

export default ScoreGauge;
