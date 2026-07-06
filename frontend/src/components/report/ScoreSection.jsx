import React from 'react';

/**
 * ScoreSection — Displays scores breakdown with visual bar indicators and rating descriptors.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const ScoreSection = ({ scores = {} }) => {
  const categories = [
    { label: 'Grammar & Tone', val: scores.grammarScore || 0 },
    { label: 'Formatting & Layout', val: scores.formattingScore || 0 },
    { label: 'Technical & Soft Skills', val: scores.skillsScore || 0 },
    { label: 'Project Experience', val: scores.projectsScore || 0 },
    { label: 'Work History & Experience', val: scores.experienceScore || 0 },
    { label: 'Education & Certifications', val: scores.educationScore || 0 },
    { label: 'Professional Summary', val: scores.summaryScore || 0 }
  ];

  const getStatusConfig = (val) => {
    if (val >= 75) return { color: 'text-emerald-500', barBg: 'bg-emerald-500', label: 'Strong' };
    if (val >= 50) return { color: 'text-amber-500', barBg: 'bg-amber-500', label: 'Average' };
    return { color: 'text-red-500', barBg: 'bg-red-500', label: 'Needs Improvement' };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((cat, idx) => {
        const { color, barBg, label } = getStatusConfig(cat.val);
        return (
          <div key={idx} className="rounded-xl border border-border bg-surface-alt p-4 transition-all duration-150 hover:shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-2.5">
              <span className="text-body-sm font-semibold text-text-primary">{cat.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-caption font-bold ${color}`}>{label}</span>
                <span className="text-body-sm font-bold text-text-primary">{cat.val}/100</span>
              </div>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="h-2 w-full rounded-full bg-border overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                style={{ width: `${cat.val}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScoreSection;
