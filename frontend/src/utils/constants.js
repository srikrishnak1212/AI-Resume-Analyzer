/**
 * Application-wide constants
 * Single source of truth for magic strings, limits, and enums.
 *
 * Reference: SRS §4, Architecture.md, Implementation-Guide.md
 * Rule: Never duplicate code (PROJECT_RULES.md)
 */

// ── API ──────────────────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'AI Resume Analyser';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.1.0';

// ── File Upload ───────────────────────────────────────────────────────────────────
// Reference: SRS FR-04, FR-20
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_FILE_SIZE_LABEL = '5MB';
export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};
export const ACCEPTED_FILE_EXTENSIONS = ['.pdf', '.docx'];

// ── Score Thresholds ──────────────────────────────────────────────────────────────
// Reference: UI-Guide.md §2.3
export const SCORE_THRESHOLDS = {
  DANGER_MAX: 49,   // 0–49 → danger (red)
  WARNING_MAX: 74,  // 50–74 → warning (amber)
  SUCCESS_MIN: 75,  // 75–100 → success (green)
};

// ── Routes ────────────────────────────────────────────────────────────────────────
export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  DASHBOARD: '/dashboard',
  HISTORY: '/history',
  ANALYSIS: '/analysis/:resumeId',
  ANALYTICS: '/analytics',
  JOB_MATCH: '/job-match',
  COVER_LETTER: '/cover-letter',
  INTERVIEW_PREP: '/interview-prep',
  CAREER_ROADMAP: '/career-roadmap',
  REPORTS: '/reports',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  PARSED_PREVIEW: '/resumes/:resumeId/preview',
};

// ── Pagination ────────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;

// ── Theme ─────────────────────────────────────────────────────────────────────────
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// ── Analysis status ───────────────────────────────────────────────────────────────
export const ANALYSIS_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// ── Parsing status ────────────────────────────────────────────────────────────────
export const PARSING_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

// ── Interview question categories ──────────────────────────────────────────────────
export const INTERVIEW_CATEGORIES = {
  TECHNICAL: 'Technical',
  BEHAVIORAL: 'Behavioral',
  HR: 'HR',
  ROLE_SPECIFIC: 'Role-Specific',
};

// ── Cover letter tones ────────────────────────────────────────────────────────────
export const COVER_LETTER_TONES = ['Professional', 'Startup', 'Corporate', 'Friendly', 'Formal'];

// ── Local storage keys ────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  THEME: 'ai-resume-theme',
  AUTH_TOKEN: 'ai-resume-token',
};
