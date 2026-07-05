import { useNavigate } from 'react-router-dom';
import { BrainCircuit, LogOut, Sun, Moon, Sparkles, User as UserIcon, Calendar, ShieldCheck, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatDate';

/**
 * DashboardPage (Phase 2 Stub)
 * Shows current user profile details, theme switcher, and sign-out controls.
 * Validates PrivateRoute integration.
 *
 * Reference: UI-Guide.md §7.5, Implementation-Guide.md Phase 2
 * Rule: Functional Component + Hooks, Tailwind only (PROJECT_RULES.md)
 */
const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" strokeWidth={1.75} />
            <span className="text-h3 font-semibold text-text-primary">ResumeAI</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-md p-2 text-icon-default hover:bg-surface-alt hover:text-text-primary"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-semibold text-body-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline text-body font-medium text-text-primary">
                {user?.fullName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
              className="text-danger hover:bg-danger-light hover:text-danger"
            >
              Sign out
            </Button>
          </div>
        </nav>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-content px-6 py-10">
        <div className="mb-8">
          <h1 className="text-h1 font-bold text-text-primary flex items-center gap-2">
            Welcome back, {user?.fullName || 'User'}!
            <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Authentication successfully verified. Private route guard active.
          </p>
        </div>

        {/* ── Profile Detail Cards ───────────────────────────────────────────── */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Account Details */}
          <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-primary-light p-2 text-primary">
                <UserIcon className="h-5 w-5" />
              </div>
              <h3 className="text-h3 font-semibold text-text-primary">Account Details</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-caption text-text-muted select-none">Full Name</p>
                <p className="text-body font-medium text-text-primary">{user?.fullName}</p>
              </div>
              <div>
                <p className="text-caption text-text-muted select-none">Email Address</p>
                <p className="text-body font-medium text-text-primary">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Security & Status */}
          <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-success-light p-2 text-success">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-h3 font-semibold text-text-primary">Status</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-caption text-text-muted select-none">Email Verification</p>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-semibold ${
                  user?.isEmailVerified ? 'bg-success-light text-success' : 'bg-warning-light text-warning'
                }`}>
                  {user?.isEmailVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              <div>
                <p className="text-caption text-text-muted select-none">Joined On</p>
                <p className="text-body font-medium text-text-primary flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-icon-default" />
                  {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Plan details */}
          <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-secondary-light p-2 text-secondary">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="text-h3 font-semibold text-text-primary">Plan & Usage</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-caption text-text-muted select-none">Current Tier</p>
                <span className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-0.5 text-caption font-semibold uppercase tracking-wider text-primary">
                  {user?.planTier || 'free'}
                </span>
              </div>
              <div>
                <p className="text-caption text-text-muted select-none">Resumes Analyzed</p>
                <p className="text-body font-medium text-text-primary">
                  {user?.resumeCount || 0} / 3 (Free Limit)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
