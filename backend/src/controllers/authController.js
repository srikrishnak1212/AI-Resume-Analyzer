'use strict';

/**
 * Auth Controller — handles HTTP layer for all /api/v1/auth routes.
 * Thin: parse inputs, call authService, format response, set cookies.
 * Reference: Architecture.md §4.1, API.md §2
 */

const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseFormatter');
const { refreshCookieOptions } = require('../utils/jwtUtils');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Extract validation errors and throw AppError on failure. */
const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw new AppError('Validation failed.', 400, 'VALIDATION_ERROR', details);
  }
};

const getClientMeta = (req) => ({
  ipAddress: req.ip || req.socket?.remoteAddress || null,
  userAgent: req.get('user-agent') || null,
});

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, refreshCookieOptions());
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', { path: '/', httpOnly: true });
};

// ── Register ──────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { fullName, email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.register(
    { fullName, email, password },
    getClientMeta(req)
  );

  setRefreshCookie(res, refreshToken);

  return sendSuccess(res, { statusCode: 201, message: 'Account created successfully.', data: { user, accessToken } });
});

// ── Login ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.login(
    { email, password },
    getClientMeta(req)
  );

  setRefreshCookie(res, refreshToken);

  return sendSuccess(res, { message: 'Login successful.', data: { user, accessToken } });
});

// ── Refresh token ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) {
    throw new AppError('Refresh token missing.', 401, 'MISSING_TOKEN');
  }

  const { accessToken, refreshToken: newRawRefreshToken } = await authService.refreshTokens(
    rawRefreshToken,
    getClientMeta(req)
  );

  setRefreshCookie(res, newRawRefreshToken);

  return sendSuccess(res, { message: 'Token refreshed.', data: { accessToken } });
});

// ── Logout ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  const userId = req.user?._id;

  if (userId) {
    await authService.logout(rawRefreshToken, userId);
  }

  clearRefreshCookie(res);

  return sendSuccess(res, { message: 'Logged out successfully.', data: null });
});

// ── Forgot password ────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { email } = req.body;

  // Silent — always returns 200 regardless of whether email exists (no enumeration)
  await authService.forgotPassword(email);

  return sendSuccess(res, {
    message: 'If an account with that email exists, a reset link has been sent.',
    data: null,
  });
});

// ── Reset password ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { token, password } = req.body;

  await authService.resetPassword(token, password);

  return sendSuccess(res, { message: 'Password reset successfully. Please log in.', data: null });
});

// ── Get current user ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/me
 * Protected — requires valid access token.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  return sendSuccess(res, { data: { user } });
});

module.exports = { register, login, refreshToken, logout, forgotPassword, resetPassword, getMe };
