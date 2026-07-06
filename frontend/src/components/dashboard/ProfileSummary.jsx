import React from 'react';
import { User, Shield, Calendar, FileText, Sparkles } from 'lucide-react';
import DashboardCard from './DashboardCard';

/**
 * ProfileSummary — User profile card displaying info and statistics.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const ProfileSummary = ({ userProfile, metrics, className = '' }) => {
  if (!userProfile) return null;

  const { fullName, email, planTier, createdAt } = userProfile;
  const { totalResumes = 0, totalAnalyses = 0 } = metrics || {};
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const firstLetter = fullName ? fullName.charAt(0).toUpperCase() : '?';

  return (
    <DashboardCard className={`overflow-hidden ${className}`}>
      <div className="flex flex-col items-center text-center pb-2">
        {/* Profile Photo Placeholder */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-primary border-4 border-surface shadow-xs">
          <span className="text-3xl font-black">{firstLetter}</span>
          <span className="absolute bottom-0 right-0 rounded-full bg-success p-1.5 border-2 border-surface" />
        </div>

        {/* User Name & Email */}
        <h3 className="mt-4 text-lg font-black text-text-primary tracking-tight">{fullName}</h3>
        <p className="text-body-sm text-text-muted mt-0.5 truncate max-w-full">{email}</p>

        {/* Plan Tier Badge */}
        <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-primary-light/50 px-3 py-1 text-caption font-bold text-primary dark:bg-primary-light/10">
          <Shield className="h-3.5 w-3.5" />
          <span>{planTier} Account</span>
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5 space-y-4">
        {/* Member Since */}
        <div className="flex items-center justify-between text-body-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-icon-default" />
            <span>Member since</span>
          </div>
          <span className="font-bold text-text-primary">{formattedDate}</span>
        </div>

        {/* Total Uploads */}
        <div className="flex items-center justify-between text-body-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-icon-default" />
            <span>Resumes Uploaded</span>
          </div>
          <span className="font-bold text-text-primary">{totalResumes}</span>
        </div>

        {/* Total Analyses */}
        <div className="flex items-center justify-between text-body-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-icon-default" />
            <span>AI Analyses Run</span>
          </div>
          <span className="font-bold text-text-primary">{totalAnalyses}</span>
        </div>
      </div>
    </DashboardCard>
  );
};

export default ProfileSummary;
