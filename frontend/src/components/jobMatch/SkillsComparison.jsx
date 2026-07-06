import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * SkillsComparison — Side-by-side display of matched and missing skills.
 */
const SkillsComparison = ({ matchedSkills = [], missingSkills = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Matched Skills */}
      <div className="rounded-2xl border border-success/20 bg-success/5 dark:bg-success/10 p-6 flex flex-col h-full shadow-xs">
        <div className="flex items-center gap-2 mb-4 text-success">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <h3 className="text-body font-bold">Matched Skills ({matchedSkills.length})</h3>
        </div>
        {matchedSkills.length === 0 ? (
          <p className="text-body-sm text-text-muted italic">No matching skills detected.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-lg bg-success-light dark:bg-success/20 px-3 py-1 text-body-sm font-semibold text-success"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Missing Skills */}
      <div className="rounded-2xl border border-danger/20 bg-danger/5 dark:bg-danger/10 p-6 flex flex-col h-full shadow-xs">
        <div className="flex items-center gap-2 mb-4 text-danger">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <h3 className="text-body font-bold">Missing Required Skills ({missingSkills.length})</h3>
        </div>
        {missingSkills.length === 0 ? (
          <p className="text-body-sm text-success font-semibold italic">Excellent! You have all required skills.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-lg bg-danger-light dark:bg-danger/20 px-3 py-1 text-body-sm font-semibold text-danger animate-pulse"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsComparison;
