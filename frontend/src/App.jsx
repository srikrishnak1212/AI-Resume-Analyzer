import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import AppRoutes from './routes/AppRoutes';
import { useTheme } from './hooks/useTheme';

/**
 * App — Root component
 * Applies the active theme class to <html> and renders the route tree.
 *
 * Reference: Architecture.md §3.1, UI-Guide.md §2 (dark mode via class strategy)
 * Rule: React Functional Component + Hooks only (PROJECT_RULES.md)
 */
const App = () => {
  const { theme } = useTheme();
  const location = useLocation();

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return <AppRoutes />;
};

export default App;
