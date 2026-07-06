import React from 'react';
import { BadgeCheck, ShieldAlert } from 'lucide-react';

/**
 * SkillsCard — Visual comparison of skills detected vs skills missing.
 *
 * Reference: UI-Guide.md §7.7, AI-Prompts.md §6
 */
const SkillsCard = ({ detectedSkills = [], missingSkills = [] }) => {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-bold text-text-primary flex items-center gap-2">
        <BadgeCheck className="h-5 w-5 text-success" />
        Skills Audit
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detected Skills */}
        <div className="border border-border/50 rounded-lg p-4 bg-background/30">
          <h4 className="mb-3 text-sm font-semibold text-text-secondary flex items-center gap-1.5">
            <BadgeCheck className="h-4 w-4 text-success" />
            Detected Skills ({detectedSkills.length})
          </h4>
          {detectedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {detectedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-success-light px-2.5 py-1 text-xs font-medium text-success border border-success/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">No skills detected in resume content.</p>
          )}
        </div>

        {/* Missing Skills */}
        <div className="border border-border/50 rounded-lg p-4 bg-background/30">
          <h4 className="mb-3 text-sm font-semibold text-text-secondary flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-warning" />
            Missing Skills Gaps ({missingSkills.length})
          </h4>
          {missingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-warning-light px-2.5 py-1 text-xs font-medium text-warning border border-warning/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">No skill gaps identified for the apparent role.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsCard;
