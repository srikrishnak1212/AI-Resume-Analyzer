/**
 * Resume Service — axios wrapper for /api/v1/resumes endpoints.
 * All API calls for resume management live here.
 *
 * Reference: API.md §3, Architecture.md §3.1
 * Rule: Services handle API calls (PROJECT_RULES.md)
 */

import apiClient from './apiClient';

/**
 * Upload a resume file (PDF or DOCX).
 *
 * @param {File} file — browser File object
 * @param {string} [versionLabel] — optional user label for this version
 * @param {Function} [onProgress] — called with { loaded, total } during upload
 * @returns {Promise<{ resume: object }>}
 */
export const uploadResume = async (file, versionLabel = '', onProgress = null) => {
  const formData = new FormData();
  formData.append('resume', file);
  if (versionLabel) {
    formData.append('versionLabel', versionLabel);
  }

  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
  };

  if (onProgress) {
    config.onUploadProgress = (evt) => {
      onProgress({ loaded: evt.loaded, total: evt.total });
    };
  }

  const res = await apiClient.post('/resumes', formData, config);
  return res.data.data;
};

/**
 * List the authenticated user's resumes (paginated).
 *
 * @param {object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 * @returns {Promise<{ resumes: object[], pagination: object }>}
 */
export const listResumes = async ({ page = 1, limit = 10 } = {}) => {
  const res = await apiClient.get('/resumes', { params: { page, limit } });
  return {
    resumes: res.data.data.resumes,
    pagination: res.data.pagination,
  };
};

/**
 * Get a single resume's detail by ID.
 *
 * @param {string} resumeId
 * @returns {Promise<{ resume: object }>}
 */
export const getResume = async (resumeId) => {
  const res = await apiClient.get(`/resumes/${resumeId}`);
  return res.data.data;
};

/**
 * Soft-delete a resume.
 *
 * @param {string} resumeId
 * @returns {Promise<void>}
 */
export const deleteResume = async (resumeId) => {
  await apiClient.delete(`/resumes/${resumeId}`);
};
