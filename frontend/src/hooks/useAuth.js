import { useAuthContext } from '../context/AuthContext';

/**
 * useAuth — convenience hook for authentication state and actions.
 * Provides: user, isAuthenticated, isLoading, login, register, logout.
 */
const useAuth = () => useAuthContext();

export { useAuth };
