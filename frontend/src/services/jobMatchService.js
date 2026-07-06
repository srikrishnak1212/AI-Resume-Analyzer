import apiClient from './apiClient';

/**
 * Job Match Service Client — handles communication with job description and match comparison backend endpoints.
 *
 * Reference: API.md, Implementation-Guide.md Phase 7
 */

/**
 * Create a job description by pasting raw text
 * @param {object} data
 * @param {string} data.text
 * @param {string} [data.jobTitle]
 * @param {string} [data.companyName]
 * @returns {Promise<object>}
 */
export const createTextJobDescription = async (data) => {
  const res = await apiClient.post('/job-description/text', data);
  return res.data.data.jobDescription;
};

/**
 * Create a job description by uploading a file (FormData containing "jobDescription")
 * @param {FormData} formData
 * @returns {Promise<object>}
 */
export const uploadFileJobDescription = async (formData) => {
  const res = await apiClient.post('/job-description/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data.jobDescription;
};

/**
 * Trigger match comparison between a resume and job description
 * @param {object} data
 * @param {string} data.resumeId
 * @param {string} data.jobDescriptionId
 * @returns {Promise<object>}
 */
export const createJobMatch = async (data) => {
  const res = await apiClient.post('/job-match', data);
  return res.data.data.jobMatch;
};

/**
 * Get details of a specific job match comparison
 * @param {string} matchId
 * @returns {Promise<object>}
 */
export const getJobMatchDetails = async (matchId) => {
  const res = await apiClient.get(`/job-match/${matchId}`);
  return res.data.data.jobMatch;
};

/**
 * List all job matches for the authenticated user (paginated)
 * @param {object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 * @returns {Promise<object>}
 */
export const listJobMatches = async ({ page = 1, limit = 10 } = {}) => {
  const res = await apiClient.get('/job-match/history', { params: { page, limit } });
  return {
    matches: res.data.data.matches,
    pagination: res.data.pagination,
  };
};

/**
 * Soft-delete a job match record
 * @param {string} matchId
 * @returns {Promise<void>}
 */
export const deleteJobMatch = async (matchId) => {
  await apiClient.delete(`/job-match/${matchId}`);
};
