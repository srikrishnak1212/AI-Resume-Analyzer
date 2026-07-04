import { useThemeContext } from '../context/ThemeContext';

/**
 * useTheme — convenience hook for theme state and controls.
 * Delegates to ThemeContext.
 *
 * Reference: Architecture.md §3.1
 * Rule: Services handle API calls; hooks encapsulate behavior (PROJECT_RULES.md)
 */
const useTheme = () => useThemeContext();

export { useTheme };
