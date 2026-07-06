import React from 'react';
import { Tag } from 'lucide-react';

/**
 * KeywordSection — Displays detected, missing, and recommended keywords as visual tags.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const KeywordSection = ({ detected = [], missing = [], recommended = [] }) => {
  const categories = [
    {
      title: 'Detected Keywords',
      data: detected,
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
    },
    {
      title: 'Missing Keywords',
      data: missing,
      badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
    },
    {
      title: 'Recommended Keywords',
      data: recommended,
      badgeClass: 'bg-primary-light text-primary border border-primary/20'
    }
  ];

  return (
    <div className="space-y-6">
      {categories.map((cat, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex items-center gap-1.5 text-text-secondary font-bold text-caption uppercase tracking-wider">
            <Tag className="h-3.5 w-3.5" />
            <span>{cat.title}</span>
          </div>

          {cat.data.length === 0 ? (
            <p className="text-body-sm text-text-muted italic pl-1">No keywords identified.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pl-1">
              {cat.data.map((keyword, kidx) => (
                <span
                  key={kidx}
                  className={`inline-flex items-center rounded-lg px-2.5 py-1 text-caption font-bold ${cat.badgeClass}`}
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default KeywordSection;
