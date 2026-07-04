/**
 * Date formatting utilities
 * Consistent date/time display across the entire application.
 *
 * Rule: Never duplicate code — all date formatting comes from here (PROJECT_RULES.md)
 */

const DEFAULT_LOCALE = 'en-IN'; // India locale; change to 'en-US' for US format

/**
 * Format a date as "Jul 4, 2026".
 * @param {string | Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString(DEFAULT_LOCALE, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format a date as "Jul 4, 2026 at 5:30 PM".
 * @param {string | Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  try {
    return new Date(date).toLocaleString(DEFAULT_LOCALE, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format a date as a relative time string: "2 hours ago", "3 days ago".
 * Falls back to formatDate if the date is older than 30 days.
 * @param {string | Date} date
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  try {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMinutes = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;

    return formatDate(date);
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format file size from bytes to a human-readable string.
 * @param {number} bytes
 * @returns {string} e.g. "2.4 MB"
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
