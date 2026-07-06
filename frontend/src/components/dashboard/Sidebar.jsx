import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, Sparkles, Target, FileSignature, HelpCircle, X, FileText, Edit3 } from 'lucide-react';
import Button from '../common/Button';
import { ROUTES } from '../../utils/constants';

/**
 * Sidebar — Left collapsible navigation drawer.
 *
 * Reference: UI-Guide.md §6.2, §9 (Responsiveness)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const Sidebar = ({ isOpen, onClose }) => {
  const primaryNavItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: ROUTES.DASHBOARD,
    },
    {
      label: 'Resume History',
      icon: History,
      path: ROUTES.HISTORY,
    },
    {
      label: 'AI Analytics',
      icon: Sparkles,
      path: ROUTES.ANALYTICS,
    },
    {
      label: 'Reports & Export',
      icon: FileText,
      path: ROUTES.REPORTS,
    },
    {
      label: 'Job Match',
      icon: Target,
      path: ROUTES.JOB_MATCH,
    },
    {
      label: 'Resume Rewrite',
      icon: Edit3,
      path: ROUTES.RESUME_REWRITE,
    },
    {
      label: 'Cover Letter',
      icon: FileSignature,
      path: ROUTES.COVER_LETTER,
    },
  ];

  const comingSoonItems = [];

  const activeClass =
    'flex items-center gap-3 rounded-lg bg-primary-light px-3.5 py-2.5 text-body-sm font-semibold text-primary dark:bg-primary-light/10 border-l-[3px] border-primary transition-all duration-150';
  const inactiveClass =
    'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-body-sm font-medium text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-all duration-150';
  const disabledClass =
    'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-body-sm font-medium text-text-muted cursor-not-allowed opacity-50';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed bottom-0 top-0 left-0 z-50 flex w-[240px] flex-col border-r border-border bg-surface transition-transform duration-200 ease-in-out md:sticky md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header visible only on mobile */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border md:hidden">
          <span className="text-body font-bold text-text-primary">Navigation</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-primary"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          <div className="space-y-1">
            {primaryNavItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <p className="px-3.5 text-[11px] font-bold tracking-wider text-text-muted uppercase mb-2">
              AI Tools (Coming Soon)
            </p>
            <div className="space-y-1">
              {comingSoonItems.map((item) => (
                <div
                  key={item.label}
                  className={disabledClass}
                  title="This feature will be unlocked in a future phase."
                >
                  <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                  <span className="flex-1">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-surface-alt p-3.5 text-center">
            <HelpCircle className="h-5 w-5 mx-auto text-icon-default mb-1" />
            <p className="text-caption font-semibold text-text-primary">Need assistance?</p>
            <p className="text-[11px] text-text-muted mt-0.5">Read our user guide.</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
