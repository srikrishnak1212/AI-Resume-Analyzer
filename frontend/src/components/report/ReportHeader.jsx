import React from 'react';
import { Calendar, FileText, User } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

/**
 * ReportHeader — Header showing user info, resume version tag, and generation dates.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const ReportHeader = ({ report = {} }) => {
  const resumeName = report.resumeId?.originalFileName || report.resumeId?.fileName || 'Resume';
  const version = report.reportVersion || 1;
  const userName = report.userId?.fullName || 'User Profile';
  const generatedAt = report.generatedAt || report.createdAt;

  return (
    <div className="rounded-2xl bg-linear-to-r from-primary to-indigo-600 p-6 text-white shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-light">
            AI Resume Analyzer
          </span>
          <h2 className="text-h2 font-black mt-1">Professional Scorecard</h2>
        </div>
        <div className="text-right md:text-right shrink-0">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-caption font-bold tracking-wider backdrop-blur-xs">
            Report v{version}.0
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-4 text-white/80">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary-light" />
          <div className="text-body-sm">
            <span className="block text-[10px] uppercase font-bold text-white/50 tracking-wider">Candidate</span>
            <span className="font-semibold text-white">{userName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary-light" />
          <div className="text-body-sm">
            <span className="block text-[10px] uppercase font-bold text-white/50 tracking-wider">Resume File</span>
            <span className="font-semibold text-white truncate max-w-[180px] block">{resumeName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary-light" />
          <div className="text-body-sm">
            <span className="block text-[10px] uppercase font-bold text-white/50 tracking-wider">Generated On</span>
            <span className="font-semibold text-white">{formatDate(generatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
