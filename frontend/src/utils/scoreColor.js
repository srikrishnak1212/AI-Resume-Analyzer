/**
 * scoreColor — Maps a numeric score (0–100) to the appropriate semantic color class.
 * Used by score cards, badges, progress bars, and score rings.
 *
 * Score rule from UI-Guide.md §2.3:
 *   0–49   → danger  (red)
 *   50–74  → warning (amber)
 *   75–100 → success (green)
 *
 * Rule: Never duplicate code — single source of truth for score coloring (PROJECT_RULES.md)
 */

/**
 * Returns the Tailwind text color class for a score.
 * @param {number} score - 0–100
 * @returns {string} Tailwind class
 */
export const scoreToTextColor = (score) => {
  if (score >= 75) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-danger';
};

/**
 * Returns the Tailwind background color class for a score badge.
 * @param {number} score - 0–100
 * @returns {string} Tailwind class
 */
export const scoreToBgColor = (score) => {
  if (score >= 75) return 'bg-success-light';
  if (score >= 50) return 'bg-warning-light';
  return 'bg-danger-light';
};

/**
 * Returns the Tailwind border color class for a score card.
 * @param {number} score - 0–100
 * @returns {string} Tailwind class
 */
export const scoreToBorderColor = (score) => {
  if (score >= 75) return 'border-success';
  if (score >= 50) return 'border-warning';
  return 'border-danger';
};

/**
 * Returns a semantic label string for a score range.
 * @param {number} score - 0–100
 * @returns {string}
 */
export const scoreToLabel = (score) => {
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Needs Work';
  return 'Poor';
};

/**
 * Returns the hex color for Recharts (charts cannot use CSS variables).
 * Reference: UI-Guide.md §2.1 / §2.2 — static hex values.
 * @param {number} score - 0–100
 * @param {'light' | 'dark'} [theme='light']
 * @returns {string} hex color
 */
export const scoreToHex = (score, theme = 'light') => {
  const colors = {
    light: { success: '#16A34A', warning: '#D97706', danger: '#DC2626' },
    dark: { success: '#22C55E', warning: '#F59E0B', danger: '#EF4444' },
  };
  const palette = colors[theme] || colors.light;
  if (score >= 75) return palette.success;
  if (score >= 50) return palette.warning;
  return palette.danger;
};
