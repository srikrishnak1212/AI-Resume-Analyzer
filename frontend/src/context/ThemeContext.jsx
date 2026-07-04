import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * ThemeContext — Dark/Light mode management
 * Persists theme preference to localStorage.
 * Respects OS preference (prefers-color-scheme) on first visit.
 *
 * Reference: SRS FR-18, Architecture.md §3.1, UI-Guide.md §2 (class-based dark mode)
 * Rule: Functional component + hooks only (PROJECT_RULES.md)
 */

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = 'ai-resume-theme';
const VALID_THEMES = ['light', 'dark'];

/**
 * Detect the initial theme:
 * 1. Use persisted user preference from localStorage.
 * 2. Fall back to OS preference.
 * 3. Default to 'light'.
 */
const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && VALID_THEMES.includes(stored)) return stored;

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {
    // localStorage might be blocked in some browsers
  }
  return 'light';
};

/**
 * ThemeProvider — wraps the app and provides theme state.
 *
 * @param {{ children: React.ReactNode }} props
 */
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  // Persist theme to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Silently ignore storage errors
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setLightTheme = useCallback(() => setTheme('light'), []);
  const setDarkTheme = useCallback(() => setTheme('dark'), []);

  const value = {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setLightTheme,
    setDarkTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * useThemeContext — access the ThemeContext.
 * Throws if used outside ThemeProvider.
 *
 * @returns {object} theme context value
 */
const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used within a ThemeProvider.');
  }
  return ctx;
};

export { ThemeProvider, useThemeContext, ThemeContext };
