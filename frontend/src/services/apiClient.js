import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

/**
 * apiClient — Configured Axios instance
 * All frontend service modules import this instead of creating their own instances.
 *
 * Features:
 * - Base URL from environment variable
 * - Default Content-Type header
 * - Request ID injection
 * - Phase 2: JWT token attachment via interceptors
 * - Phase 2: Token refresh on 401 response
 *
 * Reference: Architecture.md §3.1 (services → API), API.md §1.4, §1.5
 * Rule: Services handle API calls (PROJECT_RULES.md)
 */

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30_000, // 30s — AI calls can take 15–25s (SRS §6)
  withCredentials: true, // Send HTTP-only cookies (refresh token)
});

// ── Request interceptor ────────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Generate a client-side request ID for tracing (API.md §1.5)
    config.headers['X-Request-ID'] = crypto.randomUUID();

    // Phase 2: attach access token from auth state
    // const token = authStore.getAccessToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Phase 2: handle 401 → attempt token refresh → retry original request
    // if (error.response?.status === 401 && !error.config._retried) { ... }

    return Promise.reject(error);
  }
);

export default apiClient;
