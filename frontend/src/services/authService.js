'use strict';

/**
 * Auth Service — frontend Axios wrapper for /api/v1/auth
 * Maps directly to API.md §2 endpoints.
 * Reference: Architecture.md §3.1, API.md §2
 */

import apiClient from './apiClient';

const AUTH_BASE = '/auth';

/** Register a new account */
const register = async (data) => {
  const res = await apiClient.post(`${AUTH_BASE}/register`, data);
  return res.data;
};

/** Login with email + password */
const login = async (data) => {
  const res = await apiClient.post(`${AUTH_BASE}/login`, data);
  return res.data;
};

/** Logout — clears HTTP-only refresh token cookie on server */
const logout = async () => {
  const res = await apiClient.post(`${AUTH_BASE}/logout`);
  return res.data;
};

/** Request a new access token using the refresh cookie */
const refreshToken = async () => {
  const res = await apiClient.post(`${AUTH_BASE}/refresh-token`);
  return res.data;
};

/** Initiate forgot-password email flow */
const forgotPassword = async (email) => {
  const res = await apiClient.post(`${AUTH_BASE}/forgot-password`, { email });
  return res.data;
};

/** Complete password reset with token from email link */
const resetPassword = async (token, password) => {
  const res = await apiClient.post(`${AUTH_BASE}/reset-password`, { token, password });
  return res.data;
};

/** Get current authenticated user */
const getMe = async () => {
  const res = await apiClient.get(`${AUTH_BASE}/me`);
  return res.data;
};

const authService = { register, login, logout, refreshToken, forgotPassword, resetPassword, getMe };

export default authService;
