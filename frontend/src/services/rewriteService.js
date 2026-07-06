import apiClient from './apiClient';

/**
 * Resume Rewrite Service Client — handles communication with rewrite backend endpoints.
 *
 * Reference: API.md, Implementation-Guide.md Phase 8
 */

/**
 * Trigger AI rewrite for a specific resume section
 * @param {object} data
 * @param {string} data.resumeId
 * @param {string} data.sectionName
 * @param {string} data.rewriteMode
 * @param {string} data.originalContent
 * @param {string[]} [data.improvements]
 * @returns {Promise<object>}
 */
export const triggerRewrite = async (data) => {
  const res = await apiClient.post('/resume-rewrite', data);
  return res.data.data.rewrite;
};

/**
 * Accept the AI rewrite and save as a new resume version
 * @param {string} rewriteId
 * @returns {Promise<object>} The new resume document version
 */
export const acceptRewrite = async (rewriteId) => {
  const res = await apiClient.post('/resume-rewrite/accept', { rewriteId });
  return res.data.data.resume;
};

/**
 * Reject the AI rewrite
 * @param {string} rewriteId
 * @returns {Promise<void>}
 */
export const rejectRewrite = async (rewriteId) => {
  await apiClient.post('/resume-rewrite/reject', { rewriteId });
};

/**
 * Get details of a specific rewrite comparison
 * @param {string} id
 * @returns {Promise<object>}
 */
export const getRewriteDetails = async (id) => {
  const res = await apiClient.get(`/resume-rewrite/${id}`);
  return res.data.data.rewrite;
};

/**
 * List all rewrites history (paginated)
 * @param {object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 * @returns {Promise<object>}
 */
export const listRewrites = async ({ page = 1, limit = 10 } = {}) => {
  const res = await apiClient.get('/resume-rewrite/history', { params: { page, limit } });
  return {
    rewrites: res.data.data.rewrites,
    pagination: res.data.pagination,
  };
};

/**
 * Delete rewrite record
 * @param {string} id
 * @returns {Promise<void>}
 */
export const deleteRewrite = async (id) => {
  await apiClient.delete(`/resume-rewrite/${id}`);
};
