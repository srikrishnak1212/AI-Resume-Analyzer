/**
 * Analysis Service — axios wrapper for /api/v1/analysis endpoints.
 * All API calls for AI analysis and reports history live here.
 *
 * Reference: API.md §4, Architecture.md §3.1
 * Rule: Services handle API calls (PROJECT_RULES.md)
 */

import apiClient from './apiClient';

/**
 * Trigger AI Resume Analysis for a parsed resume.
 *
 * @param {string} resumeId
 * @returns {Promise<{ analysis: object }>}
 */
export const triggerAnalysis = async (resumeId) => {
  const res = await apiClient.post(`/analysis/${resumeId}`);
  return res.data.data;
};

/**
 * Fetch the latest analysis detail for a resume.
 *
 * @param {string} resumeId
 * @returns {Promise<{ analysis: object }>}
 */
export const getAnalysis = async (resumeId) => {
  const res = await apiClient.get(`/analysis/${resumeId}`);
  return res.data.data;
};

/**
 * List the user's past analysis runs (paginated).
 *
 * @param {object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 * @returns {Promise<{ analyses: object[], pagination: object }>}
 */
export const getHistory = async ({ page = 1, limit = 10 } = {}) => {
  const res = await apiClient.get('/analysis/history', { params: { page, limit } });
  return {
    analyses: res.data.data.analyses,
    pagination: res.data.pagination,
  };
};

/**
 * Soft-delete an analysis run record.
 *
 * @param {string} analysisId
 * @returns {Promise<void>}
 */
export const deleteAnalysis = async (analysisId) => {
  await apiClient.delete(`/analysis/${analysisId}`);
};
