import { useAuthContext } from '../context/AuthContext';

/**
 * useAuth — convenience hook for auth state and actions.
 * Delegates to AuthContext.
 * Full implementation in Phase 2.
 *
 * Reference: Architecture.md §3.1
 * Rule: Hooks encapsulate behavior (PROJECT_RULES.md)
 */
const useAuth = () => useAuthContext();

export { useAuth };
