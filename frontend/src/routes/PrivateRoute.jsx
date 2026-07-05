import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';

/**
 * PrivateRoute — Route guard for authenticated pages.
 * Redirects to /login if user is not authenticated.
 * Preserves the intended destination via location state for post-login redirect.
 *
 * Reference: Architecture.md §3.1, SRS §9 (user journey step 3)
 * Rule: Functional component + hooks only (PROJECT_RULES.md)
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show a centered loading spinner while session status is restoring on app start
  if (isLoading) {
    return <Spinner layout="fullscreen" size="lg" />;
  }

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
