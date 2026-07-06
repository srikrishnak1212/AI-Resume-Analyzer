import React from 'react';
import { Sun, Moon, LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import Button from '../common/Button';

/**
 * TopNavbar — Dashboard top toolbar header.
 *
 * Reference: UI-Guide.md §6.1
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const TopNavbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4 md:px-6 shadow-xs">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="p-1.5 md:hidden text-icon-default hover:text-text-primary"
          aria-label="Toggle Sidebar Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
            R
          </div>
          <span className="text-body font-bold text-text-primary hidden sm:inline-block tracking-tight">
            AI Resume Analyzer
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2 text-icon-default hover:text-text-primary hover:bg-surface-alt rounded-full transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        {/* User profile section */}
        {user && (
          <div className="flex items-center gap-3 pl-2 border-l border-border">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary font-bold text-sm">
                {user.fullName ? user.fullName[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
              </div>
              <span className="text-body-sm font-semibold text-text-primary hidden md:inline-block max-w-[120px] truncate">
                {user.fullName}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="p-2 text-icon-default hover:text-danger hover:bg-danger-light/20 rounded-full transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNavbar;
