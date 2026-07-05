'use strict';

/**
 * Auth Service — business logic for all authentication flows.
 * Controllers call this; no HTTP objects here.
 * Reference: Architecture.md §4.1, API.md §2
 */

const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { hashPassword, comparePassword } = require('../utils/bcryptHelper');
const { signAccessToken, signRefreshToken, getRefreshTokenExpiry } = require('../utils/jwtUtils');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailUtils');
const AppError = require('../utils/AppError');

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Hash a token for secure DB storage (so raw token is never persisted).
 * @param {string} token
 * @returns {string} SHA-256 hex digest
 */
const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

/**
 * Build the standard auth response shape.
 * @param {import('../models/User').UserDocument} user
 * @returns {{ accessToken: string, user: object }}
 */
const buildAuthPayload = (user) => ({
  user: {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    planTier: user.planTier,
    resumeCount: user.resumeCount,
    createdAt: user.createdAt,
  },
});

// ── Register ──────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {{ fullName, email, password }} data
 * @param {{ ipAddress, userAgent }} meta
 * @returns {{ user, accessToken, refreshToken }}
 */
const register = async ({ fullName, email, password }, meta = {}) => {
  // Check for duplicate email (also covered by unique index, but gives a nicer error)
  const existing = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_CONFLICT');
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    fullName,
    email,
    passwordHash,
  });

  // Issue tokens
  const payload = { userId: user._id, role: user.role };
  const accessToken = signAccessToken(payload);
  const rawRefreshToken = signRefreshToken({ userId: user._id });

  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(rawRefreshToken),
    expiresAt: getRefreshTokenExpiry(),
    userAgent: meta.userAgent || null,
    ipAddress: meta.ipAddress || null,
  });

  // Non-blocking welcome email
  sendWelcomeEmail(user.email, user.fullName).catch(() => {});

  return { ...buildAuthPayload(user), accessToken, refreshToken: rawRefreshToken };
};

// ── Login ─────────────────────────────────────────────────────────────────────

/**
 * Authenticate user with email + password.
 * @param {{ email, password }} data
 * @param {{ ipAddress, userAgent }} meta
 * @returns {{ user, accessToken, refreshToken }}
 */
const login = async ({ email, password }, meta = {}) => {
  // Select passwordHash explicitly (field uses select: false)
  const user = await User.findOne({
    email: email.toLowerCase(),
    isDeleted: false,
    isActive: true,
  }).select('+passwordHash');

  if (!user) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  // Update login metadata
  user.lastLoginAt = new Date();
  user.loginCount += 1;
  await user.save();

  const payload = { userId: user._id, role: user.role };
  const accessToken = signAccessToken(payload);
  const rawRefreshToken = signRefreshToken({ userId: user._id });

  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(rawRefreshToken),
    expiresAt: getRefreshTokenExpiry(),
    userAgent: meta.userAgent || null,
    ipAddress: meta.ipAddress || null,
  });

  return { ...buildAuthPayload(user), accessToken, refreshToken: rawRefreshToken };
};

// ── Refresh ────────────────────────────────────────────────────────────────────

/**
 * Issue a new access token given a valid, non-revoked refresh token.
 * Rotates the refresh token (old token revoked, new one issued).
 * @param {string} rawRefreshToken
 * @param {{ ipAddress, userAgent }} meta
 * @returns {{ accessToken, refreshToken }}
 */
const refreshTokens = async (rawRefreshToken, meta = {}) => {
  const { verifyRefreshToken } = require('../utils/jwtUtils');

  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token.', 401, 'INVALID_TOKEN');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const storedToken = await RefreshToken.findOne({
    userId: decoded.userId,
    tokenHash,
    isRevoked: false,
  });

  if (!storedToken) {
    throw new AppError('Invalid or expired refresh token.', 401, 'INVALID_TOKEN');
  }

  // Revoke the old token (token rotation)
  storedToken.isRevoked = true;
  await storedToken.save();

  const user = await User.findOne({ _id: decoded.userId, isDeleted: false, isActive: true });
  if (!user) {
    throw new AppError('User account not found or deactivated.', 401, 'INVALID_TOKEN');
  }

  // Issue new tokens
  const payload = { userId: user._id, role: user.role };
  const newAccessToken = signAccessToken(payload);
  const newRawRefreshToken = signRefreshToken({ userId: user._id });

  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(newRawRefreshToken),
    expiresAt: getRefreshTokenExpiry(),
    userAgent: meta.userAgent || null,
    ipAddress: meta.ipAddress || null,
  });

  return { accessToken: newAccessToken, refreshToken: newRawRefreshToken };
};

// ── Logout ─────────────────────────────────────────────────────────────────────

/**
 * Revoke all refresh tokens for a user session.
 * @param {string} rawRefreshToken - token from the cookie
 * @param {string} userId
 */
const logout = async (rawRefreshToken, userId) => {
  if (rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await RefreshToken.findOneAndUpdate(
      { userId, tokenHash, isRevoked: false },
      { isRevoked: true }
    );
  }
};

// ── Forgot Password ────────────────────────────────────────────────────────────

/**
 * Generate a password reset token and send email.
 * Returns silently whether or not the email exists (security: no user enumeration).
 * @param {string} email
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
    isDeleted: false,
    isActive: true,
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) return; // Silent — no user enumeration

  // Generate a random 32-byte token, store its hash
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(rawToken);

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, rawToken);
  } catch {
    // Reset fields if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    throw new AppError('Failed to send reset email. Please try again.', 500, 'EMAIL_FAILED');
  }
};

// ── Reset Password ─────────────────────────────────────────────────────────────

/**
 * Reset password using a valid token.
 * @param {string} rawToken - plaintext token from URL
 * @param {string} newPassword - new plaintext password
 */
const resetPassword = async (rawToken, newPassword) => {
  const hashedToken = hashToken(rawToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
    isDeleted: false,
  }).select('+passwordHash +passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AppError('Password reset token is invalid or has expired.', 400, 'INVALID_TOKEN');
  }

  user.passwordHash = await hashPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Revoke all existing refresh tokens (force re-login)
  await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });
};

// ── Get me ─────────────────────────────────────────────────────────────────────

/**
 * Fetch the current authenticated user by ID.
 * @param {string} userId
 * @returns {import('../models/User').UserDocument}
 */
const getMe = async (userId) => {
  const user = await User.findOne({ _id: userId, isDeleted: false, isActive: true });
  if (!user) {
    throw new AppError('User not found.', 404, 'NOT_FOUND');
  }
  return user;
};

module.exports = { register, login, refreshTokens, logout, forgotPassword, resetPassword, getMe };
