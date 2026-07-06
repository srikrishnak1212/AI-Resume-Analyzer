/**
 * Analytics Service — axios wrapper for /api/v1/analytics endpoints.
 *
 * Reference: API.md, Architecture.md §3.1
 * Rule: Services handle API calls (PROJECT_RULES.md)
 */

import apiClient from './apiClient';

/**
 * Fetch consolidated analytics summary statistics.
 *
 * @param {object} [filters] - Filters (resumeId, startDate, endDate, minScore, maxScore)
 * @returns {Promise<object>} Summary details
 */
export const getAnalyticsSummary = async (filters = {}) => {
  const res = await apiClient.get('/analytics', { params: filters });
  return res.data.data;
};

/**
 * Fetch paginated history list of completed analyses.
 *
 * @param {object} [filters] - Query filters
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Capped item count
 * @returns {Promise<object>} Analyses list and pagination metadata
 */
export const getAnalyticsHistory = async (filters = {}, page = 1, limit = 10) => {
  const res = await apiClient.get('/analytics/history', {
    params: { ...filters, page, limit }
  });
  return {
    analyses: res.data.data.analyses,
    pagination: res.data.pagination
  };
};

/**
 * Fetch version scores progression trends.
 *
 * @param {object} [filters] - Query filters
 * @returns {Promise<Array>} Trends points array
 */
export const getAnalyticsTrends = async (filters = {}) => {
  const res = await apiClient.get('/analytics/trends', { params: filters });
  return res.data.data;
};

/**
 * Fetch side-by-side version comparison deltas.
 *
 * @param {string} resumeId - Specific resume ID to compare
 * @returns {Promise<object>} Comparison report
 */
export const getAnalyticsComparison = async (resumeId) => {
  const res = await apiClient.get(`/analytics/comparison/${resumeId}`);
  return res.data.data;
};

/**
 * Fetch radar chart data and keyword distributions.
 *
 * @param {string} [resumeId] - Optional target resume version ID
 * @returns {Promise<object>} Skills metrics
 */
export const getSkillsAnalytics = async (resumeId = null) => {
  const params = resumeId ? { resumeId } : {};
  const res = await apiClient.get('/analytics/skills', { params });
  return res.data.data;
};
