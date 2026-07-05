import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

/**
 * apiClient — Configured Axios instance
 * All frontend service modules import this.
 * Reference: Architecture.md §3.1, API.md §1.4, §1.5
 */

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30_000, // 30s for AI calls (SRS §6)
  withCredentials: true, // Send HTTP-only refresh token cookie on every request
});

// ── Request interceptor ────────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Inject request ID for tracing (API.md §1.5)
    config.headers['X-Request-ID'] = crypto.randomUUID();

    // Attach access token from memory if available
    const token = window.__authToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 + auto-refresh ──────────────────────────
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retried &&
      !original.url?.includes('/auth/refresh-token') &&
      !original.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue requests while refresh is in-flight
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return apiClient(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retried = true;
      isRefreshing = true;

      try {
        const res = await apiClient.post('/auth/refresh-token');
        const newToken = res.data?.data?.accessToken;

        if (newToken) {
          window.__authToken = newToken;
          processQueue(null, newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(original);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.__authToken = null;
        // Dispatch a custom event so AuthContext can redirect to login
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
