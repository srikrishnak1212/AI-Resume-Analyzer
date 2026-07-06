import React from 'react';
import { ArrowUpCircle, ArrowRightCircle, ArrowDownCircle } from 'lucide-react';

/**
 * RecommendationCard — Renders actionable AI suggestions grouped by priority levels.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const RecommendationCard = ({ priority, suggestions = [] }) => {
  const config = {
    high: {
      title: 'High Priority Recommendations',
      borderColor: 'border-red-500/30 dark:border-red-500/20',
      bgColor: 'bg-red-500/5',
      textColor: 'text-red-600 dark:text-red-400',
      icon: ArrowUpCircle
    },
    medium: {
      title: 'Medium Priority Recommendations',
      borderColor: 'border-amber-500/30 dark:border-amber-500/20',
      bgColor: 'bg-amber-500/5',
      textColor: 'text-amber-600 dark:text-amber-400',
      icon: ArrowRightCircle
    },
    low: {
      title: 'Low Priority Recommendations',
      borderColor: 'border-blue-500/30 dark:border-blue-500/20',
      bgColor: 'bg-blue-500/5',
      textColor: 'text-blue-600 dark:text-blue-400',
      icon: ArrowDownCircle
    }
  };

  const { title, borderColor, bgColor, textColor, icon: Icon } = config[priority] || config.low;

  if (suggestions.length === 0) return null;

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-5 shadow-xs`}>
      <div className="flex items-center gap-2 mb-3.5">
        <Icon className={`h-5 w-5 ${textColor}`} />
        <h4 className="text-body-sm font-bold text-text-primary uppercase tracking-wide">{title}</h4>
      </div>
      <ul className="space-y-2.5">
        {suggestions.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-body-sm text-text-secondary leading-relaxed">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${textColor} bg-current mt-2 shrink-0`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendationCard;
