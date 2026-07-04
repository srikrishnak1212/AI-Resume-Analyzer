import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

/**
 * NotFoundPage — 404 fallback page.
 * Shown when a user navigates to a route that doesn't exist.
 *
 * Reference: UI-Guide.md §8.3 (error boundary / fallback screens),
 *            Architecture.md §3.1
 * Rule: Functional component + hooks, Tailwind only (PROJECT_RULES.md)
 */

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => navigate(-1);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-alt">
        <FileQuestion className="h-10 w-10 text-text-muted" strokeWidth={1.5} />
      </div>

      {/* Status code */}
      <p className="mb-2 text-caption font-semibold uppercase tracking-widest text-primary">
        404 — Page not found
      </p>

      {/* Heading */}
      <h1 className="mb-4 text-h1 font-bold text-text-primary">
        This page doesn&apos;t exist
      </h1>

      {/* Description */}
      <p className="mb-8 max-w-md text-body-lg text-text-secondary">
        The page you&apos;re looking for may have been moved, deleted, or never existed.
        Check the URL or head back to the homepage.
      </p>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          to={ROUTES.LANDING}
          id="not-found-home-link"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-btn font-semibold text-white hover:bg-primary-hover"
        >
          <Home className="h-4 w-4" />
          Go to homepage
        </Link>
        <button
          onClick={handleGoBack}
          id="not-found-back-btn"
          className="inline-flex items-center gap-2 rounded-md border border-border-strong px-5 py-2.5 text-btn font-semibold text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
