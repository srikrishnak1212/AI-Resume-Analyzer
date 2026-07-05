import { BrainCircuit } from 'lucide-react';
import cn from '../../utils/cn';

/**
 * AuthCard — Shared layout wrapper for authentication pages.
 * Displays logo, title, and form body in a premium-styled card.
 *
 * Reference: UI-Guide.md §7.2, §7.3, §7.4
 * Rule: Functional Component, Tailwind only, under 300 lines (PROJECT_RULES.md)
 */
const AuthCard = ({
  children,
  className,
  title,
  subtitle,
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      {/* ── Logo & Title ────────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light shadow-sm">
          <BrainCircuit className="h-7 w-7 text-primary" strokeWidth={1.75} />
        </div>
        <div className="text-center">
          <h1 className="text-h2 font-bold text-text-primary">ResumeAI</h1>
          <p className="text-caption text-text-muted mt-0.5">AI-Powered Career Coach</p>
        </div>
      </div>

      {/* ── Main Form Card ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          'w-full max-w-[420px] rounded-lg border border-border bg-surface p-8 shadow-sm transition-all duration-200 hover:shadow-md',
          className
        )}
      >
        {title && (
          <div className="mb-6 text-center">
            <h2 className="text-h3 font-semibold text-text-primary">{title}</h2>
            {subtitle && (
              <p className="text-body-sm text-text-secondary mt-1">{subtitle}</p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default AuthCard;
