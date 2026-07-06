import apiClient from './apiClient';

/**
 * Cover Letter Service Client — handles communication with cover letter backend endpoints.
 *
 * Reference: API.md, Implementation-Guide.md Phase 8
 */

/**
 * Generate a personalized cover letter
 * @param {object} data
 * @param {string} data.resumeId
 * @param {string} [data.jobDescriptionId]
 * @param {string} data.companyName
 * @param {string} data.jobTitle
 * @param {string} [data.hiringManager]
 * @param {string} data.tone
 * @param {string} data.length
 * @returns {Promise<object>}
 */
export const generateCoverLetter = async (data) => {
  const res = await apiClient.post('/cover-letter', data);
  return res.data.data.coverLetter;
};

/**
 * Get details of a specific cover letter
 * @param {string} id
 * @returns {Promise<object>}
 */
export const getCoverLetterDetails = async (id) => {
  const res = await apiClient.get(`/cover-letter/${id}`);
  return res.data.data.coverLetter;
};

/**
 * List all cover letters history (paginated)
 * @param {object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 * @returns {Promise<object>}
 */
export const listCoverLetters = async ({ page = 1, limit = 10 } = {}) => {
  const res = await apiClient.get('/cover-letter/history', { params: { page, limit } });
  return {
    coverLetters: res.data.data.coverLetters,
    pagination: res.data.pagination,
  };
};

/**
 * Delete cover letter record
 * @param {string} id
 * @returns {Promise<void>}
 */
export const deleteCoverLetter = async (id) => {
  await apiClient.delete(`/cover-letter/${id}`);
};

/**
 * Download Cover Letter PDF file as a blob
 * @param {string} id
 * @returns {Promise<Blob>}
 */
export const downloadCoverLetterPDF = async (id) => {
  const response = await apiClient.get(`/cover-letter/${id}/download/pdf`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Download Cover Letter DOCX file as a blob
 * @param {string} id
 * @returns {Promise<Blob>}
 */
export const downloadCoverLetterDOCX = async (id) => {
  const response = await apiClient.get(`/cover-letter/${id}/download/docx`, {
    responseType: 'blob',
  });
  return response.data;
};
