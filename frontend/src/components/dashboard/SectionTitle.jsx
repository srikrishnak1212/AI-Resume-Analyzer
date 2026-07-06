import React from 'react';

/**
 * SectionTitle — Typography title helper for dashboard modules.
 *
 * Reference: UI-Guide.md §2 (Typography)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const SectionTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-bold tracking-tight text-text-primary ${className}`}>
    {children}
  </h3>
);

export default SectionTitle;
