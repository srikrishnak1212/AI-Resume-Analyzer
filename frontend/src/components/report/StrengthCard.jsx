import React from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * StrengthCard — Renders a key strength with visual indicators.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const StrengthCard = ({ text }) => {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-all duration-200 hover:bg-emerald-500/10">
      <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
      <span className="text-body-sm font-semibold text-text-primary dark:text-emerald-50">{text}</span>
    </div>
  );
};

export default StrengthCard;
