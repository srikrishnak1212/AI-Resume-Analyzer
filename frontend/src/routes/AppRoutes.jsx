import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute from './PrivateRoute';

/**
 * AppRoutes — Route configuration for the entire application.
 * Uses React.lazy for code splitting — each route is a separate JS chunk.
 *
 * Reference: Architecture.md §3.1, SRS §9 (user journey), UI-Guide.md §7 (pages),
 *            Implementation-Guide.md §4
 * Rule: Functional component only (PROJECT_RULES.md)
 */

// ── Lazy-loaded pages (code splitting) ──────────────────────────────────────────
// Public pages
const LandingPage = lazy(() => import('../pages/Landing/LandingPage'));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage'));

// Phase 2: Auth pages (uncomment when implemented)
// const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
// const RegisterPage = lazy(() => import('../pages/Auth/RegisterPage'));
// const ForgotPasswordPage = lazy(() => import('../pages/Auth/ForgotPasswordPage'));
// const ResetPasswordPage = lazy(() => import('../pages/Auth/ResetPasswordPage'));

// Phase 3+: Protected pages (uncomment as phases complete)
// const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));
// const ResumeHistoryPage = lazy(() => import('../pages/History/ResumeHistoryPage'));
// const AnalysisResultsPage = lazy(() => import('../pages/ResumeAnalysis/AnalysisResultsPage'));
// const JobMatchPage = lazy(() => import('../pages/JobMatch/JobMatchPage'));
// const CoverLetterPage = lazy(() => import('../pages/CoverLetter/CoverLetterPage'));
// const InterviewPrepPage = lazy(() => import('../pages/InterviewPrep/InterviewPrepPage'));
// const CareerRoadmapPage = lazy(() => import('../pages/CareerRoadmap/CareerRoadmapPage'));
// const ReportsPage = lazy(() => import('../pages/Reports/ReportsPage'));
// const ProfilePage = lazy(() => import('../pages/Profile/ProfilePage'));
// const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage'));

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
      <Route path="/" element={<LandingPage />} />

      {/* Phase 2: Auth routes */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
      {/* <Route path="/register" element={<RegisterPage />} /> */}
      {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
      {/* <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> */}

      {/* Phase 3+: Protected routes */}
      {/* <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} /> */}
      {/* <Route path="/history" element={<PrivateRoute><ResumeHistoryPage /></PrivateRoute>} /> */}
      {/* <Route path="/analysis/:resumeId" element={<PrivateRoute><AnalysisResultsPage /></PrivateRoute>} /> */}
      {/* <Route path="/job-match" element={<PrivateRoute><JobMatchPage /></PrivateRoute>} /> */}
      {/* <Route path="/cover-letter" element={<PrivateRoute><CoverLetterPage /></PrivateRoute>} /> */}
      {/* <Route path="/interview-prep" element={<PrivateRoute><InterviewPrepPage /></PrivateRoute>} /> */}
      {/* <Route path="/career-roadmap" element={<PrivateRoute><CareerRoadmapPage /></PrivateRoute>} /> */}
      {/* <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} /> */}
      {/* <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} /> */}
      {/* <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} /> */}

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
