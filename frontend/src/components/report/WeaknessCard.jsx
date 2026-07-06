import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * WeaknessCard — Renders an area for improvement.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const WeaknessCard = ({ text }) => {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 transition-all duration-200 hover:bg-red-500/10">
      <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
      <span className="text-body-sm font-semibold text-text-primary dark:text-red-50">{text}</span>
    </div>
  );
};

export default WeaknessCard;
