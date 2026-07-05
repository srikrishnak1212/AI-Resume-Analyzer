'use strict';

/**
 * JWT Utilities — token signing, verification, and payload helpers.
 * Reference: Architecture.md §7 (Authentication Flow), API.md §14
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Sign an access token (short-lived).
 * @param {object} payload - Data to embed (userId, role)
 * @returns {string} signed JWT
 */
const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'ai-resume-analyser',
  });

/**
 * Sign a refresh token (long-lived, stored hashed in DB).
 * @param {object} payload - Data to embed (userId)
 * @returns {string} signed JWT
 */
const signRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'ai-resume-analyser',
  });

/**
 * Verify an access token.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
const verifyAccessToken = (token) =>
  jwt.verify(token, config.jwt.accessSecret, { issuer: 'ai-resume-analyser' });

/**
 * Verify a refresh token.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
const verifyRefreshToken = (token) =>
  jwt.verify(token, config.jwt.refreshSecret, { issuer: 'ai-resume-analyser' });

/**
 * Calculate the absolute expiry Date for a refresh token.
 * Parses config value like "7d" → Date 7 days from now.
 * @returns {Date}
 */
const getRefreshTokenExpiry = () => {
  const value = config.jwt.refreshExpiresIn; // e.g. "7d", "30d"
  const unit = value.slice(-1);
  const amount = parseInt(value.slice(0, -1), 10);

  const ms = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }[unit] || 24 * 60 * 60 * 1000;

  return new Date(Date.now() + amount * ms);
};

/**
 * Build the standard cookie options for the HTTP-only refresh token cookie.
 * Reference: Architecture.md §7, API.md §1.4
 * @returns {import('express').CookieOptions}
 */
const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/',
});

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
  refreshCookieOptions,
};
