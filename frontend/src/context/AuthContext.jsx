import { createContext, useContext, useState, useCallback } from 'react';

/**
 * AuthContext — Authentication state management (Phase 1 Stub)
 * Full implementation in Phase 2 (JWT login/register/refresh).
 * This stub provides the correct shape so routes and guards work without errors.
 *
 * Reference: Architecture.md §7, SRS FR-01, FR-02, Implementation-Guide.md Phase 2
 * Rule: Functional component + hooks only (PROJECT_RULES.md)
 */

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and provides auth state.
 *
 * @param {{ children: React.ReactNode }} props
 */
const AuthProvider = ({ children }) => {
  // Phase 2: replace with real JWT-based state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Phase 2: implement real login
  const login = useCallback(async (_credentials) => {
    throw new Error('Authentication not yet implemented. Phase 2.');
  }, []);

  // Phase 2: implement real register
  const register = useCallback(async (_userData) => {
    throw new Error('Authentication not yet implemented. Phase 2.');
  }, []);

  // Phase 2: implement real logout (clear tokens + redirect)
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuthContext — access the AuthContext.
 * Throws if used outside AuthProvider.
 *
 * @returns {object} auth context value
 */
const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider.');
  }
  return ctx;
};

export { AuthProvider, useAuthContext, AuthContext };
