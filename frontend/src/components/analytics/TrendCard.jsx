import React from 'react';
import { Sparkles, TrendingUp, Award, Clock } from 'lucide-react';
import DashboardCard from '../dashboard/DashboardCard';

/**
 * TrendCard — Individual card highlighting resume trend insights.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const TrendCard = ({ type = 'improvement', value = '', subtitle = '', description = '', className = '' }) => {
  let Icon = TrendingUp;
  let bgClass = 'bg-primary-light text-primary dark:bg-primary-light/10';

  if (type === 'best') {
    Icon = Award;
    bgClass = 'bg-success-light text-success dark:bg-success-light/10';
  } else if (type === 'insights') {
    Icon = Sparkles;
    bgClass = 'bg-warning-light text-warning dark:bg-warning-light/10';
  } else if (type === 'duration') {
    Icon = Clock;
    bgClass = 'bg-info-light text-info dark:bg-info-light/10';
  }

  return (
    <DashboardCard className={`flex items-start gap-4 min-h-[110px] ${className}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgClass}`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">{subtitle}</span>
        <div className="text-xl font-black text-text-primary mt-1 tracking-tight truncate">
          {value}
        </div>
        {description && <p className="text-caption text-text-muted mt-1 leading-normal font-semibold">{description}</p>}
      </div>
    </DashboardCard>
  );
};

export default TrendCard;
