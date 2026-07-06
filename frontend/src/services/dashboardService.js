/**
 * Dashboard Service — axios wrapper for /api/v1/dashboard endpoints.
 *
 * Reference: API.md, Architecture.md §3.1
 * Rule: Services handle API calls (PROJECT_RULES.md)
 */

import apiClient from './apiClient';

/**
 * Fetch consolidated dashboard metrics and profile summary.
 *
 * @returns {Promise<object>} Dashboard metrics payload
 */
export const getDashboardStats = async () => {
  const res = await apiClient.get('/dashboard');
  return res.data.data;
};

/**
 * Fetch recent uploads, analyses, and activities datasets.
 *
 * @param {number} [limit=5] - Maximum item count to retrieve
 * @returns {Promise<object>} Recent datasets
 */
export const getRecentActivities = async (limit = 5) => {
  const res = await apiClient.get('/dashboard/recent', { params: { limit } });
  return res.data.data;
};
