import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import authService from '../services/authService';

/**
 * AuthContext — Full JWT authentication state management.
 * Access token stored in memory (window.__authToken) for XSS protection.
 * Refresh token stored in HTTP-only cookie (managed by the server).
 *
 * Reference: Architecture.md §7, SRS FR-01, FR-02
 */

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // True during initial session restore

  // ── Session restore on app mount ─────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Attempt to get a new access token using the refresh cookie
        const res = await authService.refreshToken();
        const newAccessToken = res?.data?.accessToken;
        if (newAccessToken) {
          window.__authToken = newAccessToken;
          // Fetch user profile with the new token
          const meRes = await authService.getMe();
          setUser(meRes?.data?.user || null);
        }
      } catch {
        // No valid refresh cookie — user is logged out
        window.__authToken = null;
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    // Listen for forced logout events from the API interceptor
    const handleForcedLogout = () => {
      window.__authToken = null;
      setUser(null);
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    const { user: userData, accessToken } = res.data;
    window.__authToken = accessToken;
    setUser(userData);
    return userData;
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    const res = await authService.register(userData);
    const { user: newUser, accessToken } = res.data;
    window.__authToken = accessToken;
    setUser(newUser);
    return newUser;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors — clear local state regardless
    } finally {
      window.__authToken = null;
      setUser(null);
    }
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

const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider.');
  return ctx;
};

export { AuthProvider, useAuthContext, AuthContext };
