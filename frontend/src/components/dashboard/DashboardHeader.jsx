import React from 'react';

/**
 * DashboardHeader — Top page header component rendering page titles and helper subtexts.
 *
 * Reference: UI-Guide.md §2 (Typography)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const DashboardHeader = ({ title, description, children }) => {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-5 mb-6">
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="text-body-sm text-text-muted mt-0.5">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-3 mt-4 md:mt-0">{children}</div>}
    </div>
  );
};

export default DashboardHeader;
