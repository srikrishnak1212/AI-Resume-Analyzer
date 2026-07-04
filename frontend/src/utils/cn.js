/**
 * cn — Class Name utility
 * Merges Tailwind class strings while removing duplicates and falsy values.
 * Works like clsx without an extra dependency.
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-primary', 'text-white')
 *   // → 'px-4 py-2 bg-primary text-white' (when isActive = true)
 *
 * Rule: Never duplicate code (PROJECT_RULES.md)
 */

/**
 * @param {...(string | undefined | null | false)} classes
 * @returns {string}
 */
const cn = (...classes) =>
  classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

export default cn;
