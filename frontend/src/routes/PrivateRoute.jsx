import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * PrivateRoute — Route guard for authenticated pages.
 * Redirects to /login if user is not authenticated.
 * Preserves the intended destination via location state for post-login redirect.
 *
 * Reference: Architecture.md §3.1, SRS §9 (user journey step 3),
 *            Implementation-Guide.md Phase 2
 * Rule: Functional component + hooks only (PROJECT_RULES.md)
 *
 * @param {{ children: React.ReactNode }} props
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show nothing during auth state initialization (Phase 2: spinner here)
  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};

export default PrivateRoute;
