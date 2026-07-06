import apiClient from './apiClient';

/**
 * Report Service Client — handles communication with report-related backend endpoints.
 *
 * Reference: API.md, Implementation-Guide.md Phase 6C
 */

/**
 * List all reports for the authenticated user (paginated)
 */
export const listReports = async ({ page = 1, limit = 10 } = {}) => {
  const res = await apiClient.get('/reports', { params: { page, limit } });
  return res.data.data;
};

/**
 * Retrieve specific report metadata and populated references
 */
export const getReportDetails = async (reportId) => {
  const res = await apiClient.get(`/reports/${reportId}`);
  return res.data.data.report;
};

/**
 * Generate/retrieve a report for a completed analysis
 */
export const generateReport = async (analysisId) => {
  const res = await apiClient.post('/reports', { analysisId });
  return res.data.data.report;
};

/**
 * Download Report PDF file as a blob
 */
export const downloadReportPDF = async (reportId) => {
  const response = await apiClient.get(`/reports/download/pdf/${reportId}`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Download Report JSON file as a blob
 */
export const downloadReportJSON = async (reportId) => {
  const response = await apiClient.get(`/reports/download/json/${reportId}`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Force regenerate report files (PDF and JSON) on the server
 */
export const regenerateReport = async (reportId) => {
  const res = await apiClient.post(`/reports/regenerate/${reportId}`);
  return res.data.data.report;
};

/**
 * Delete a report DB record and clean up associated files on disk
 */
export const deleteReport = async (reportId) => {
  await apiClient.delete(`/reports/${reportId}`);
};
