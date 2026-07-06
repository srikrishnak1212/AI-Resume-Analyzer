import React from 'react';

/**
 * AnalysisSection — Standard section wrapper layout for report pages.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const AnalysisSection = ({ title, children, className = '' }) => {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-1 border-b border-border pb-2.5">
        <h3 className="text-body font-black text-text-primary uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="pt-1">
        {children}
      </div>
    </section>
  );
};

export default AnalysisSection;
