import React from 'react';
import { FileUp, Sparkles } from 'lucide-react';
import DashboardCard from './DashboardCard';
import Button from '../common/Button';

/**
 * EmptyState — Centered CTA screen when user has uploaded zero resumes.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const EmptyState = ({ onUploadClick, className = '' }) => {
  return (
    <DashboardCard className={`flex flex-col items-center justify-center text-center p-8 md:p-12 ${className}`}>
      {/* Visual Icon Group */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary dark:bg-primary-light/10">
        <FileUp className="h-8 w-8" strokeWidth={1.5} />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] text-white animate-pulse">
          <Sparkles className="h-2.5 w-2.5" />
        </span>
      </div>

      {/* Narrative */}
      <h3 className="mt-6 text-xl font-black text-text-primary tracking-tight">
        Analyze your first resume
      </h3>
      <p className="mt-2 max-w-sm text-body-sm text-text-muted leading-relaxed">
        Upload your PDF or DOCX file to get instant scores, key missing keywords, and recruiter-grade feedback.
      </p>

      {/* Action Button */}
      <div className="mt-8">
        <Button
          onClick={onUploadClick}
          variant="primary"
          className="inline-flex items-center gap-2 rounded-xl py-3 px-6 shadow-sm hover:shadow-md transition-shadow font-semibold text-body-sm text-white"
        >
          <FileUp className="h-4.5 w-4.5" />
          <span>Upload Resume</span>
        </Button>
      </div>
    </DashboardCard>
  );
};

export default EmptyState;
