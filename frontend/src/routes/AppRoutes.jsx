import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import PrivateRoute from './PrivateRoute';
import { ROUTES } from '../utils/constants';

/**
 * AppRoutes — Route configuration for the entire application.
 * Uses React.lazy for code splitting — each route is a separate JS chunk.
 *
 * Reference: Architecture.md §3.1, SRS §9 (user journey), UI-Guide.md §7 (pages)
 * Rule: Functional component only (PROJECT_RULES.md)
 */

// ── Lazy-loaded pages (code splitting) ──────────────────────────────────────────
// Public pages
const LandingPage = lazy(() => import('../pages/Landing/LandingPage'));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage'));

// Phase 2: Auth pages
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/Auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/Auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/Auth/ResetPasswordPage'));

// Phase 3+: Protected pages
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));
const ResumeHistoryPage = lazy(() => import('../pages/History/ResumeHistoryPage'));
const ParsedPreviewPage = lazy(() => import('../pages/History/ParsedPreviewPage'));
const ResumeAnalysisPage = lazy(() => import('../pages/ResumeAnalysis/ResumeAnalysisPage'));
const AnalyticsPage = lazy(() => import('../pages/Analytics/AnalyticsPage'));
const ReportsPage = lazy(() => import('../pages/Reports/ReportsPage'));
const ReportViewerPage = lazy(() => import('../pages/Reports/ReportViewerPage'));
const JobMatchingPage = lazy(() => import('../pages/JobMatching/JobMatchingPage'));
const ResumeRewritePage = lazy(() => import('../pages/ResumeRewrite/ResumeRewritePage'));
const RewriteComparisonPage = lazy(() => import('../pages/ResumeRewrite/RewriteComparisonPage'));
const CoverLetterPage = lazy(() => import('../pages/CoverLetter/CoverLetterPage'));
const CoverLetterHistoryPage = lazy(() => import('../pages/CoverLetter/CoverLetterHistoryPage'));

// ── Loading fallback ─────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      <p className="text-body text-text-muted">Loading...</p>
    </div>
  </div>
);

// ── Route definitions ─────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.LANDING} element={<LandingPage />} />

      {/* Phase 2: Auth routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

      {/* Protected routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.HISTORY}
        element={
          <PrivateRoute>
            <ResumeHistoryPage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.PARSED_PREVIEW}
        element={
          <PrivateRoute>
            <ParsedPreviewPage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.ANALYSIS}
        element={
          <PrivateRoute>
            <ResumeAnalysisPage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.ANALYTICS}
        element={
          <PrivateRoute>
            <AnalyticsPage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.REPORTS}
        element={
          <PrivateRoute>
            <ReportsPage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.REPORT_VIEWER}
        element={
          <PrivateRoute>
            <ReportViewerPage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.JOB_MATCH}
        element={
          <PrivateRoute>
            <JobMatchingPage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.RESUME_REWRITE}
        element={
          <PrivateRoute>
            <ResumeRewritePage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.REWRITE_COMPARISON}
        element={
          <PrivateRoute>
            <RewriteComparisonPage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.COVER_LETTER}
        element={
          <PrivateRoute>
            <CoverLetterPage />
          </PrivateRoute>
        }
      />
      <Route
        path={ROUTES.COVER_LETTER_HISTORY}
        element={
          <PrivateRoute>
            <CoverLetterHistoryPage />
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
