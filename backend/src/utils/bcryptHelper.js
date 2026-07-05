'use strict';

/**
 * bcrypt Helper — password hashing and comparison utilities.
 * Centralised to ensure consistent salt rounds across the codebase.
 * Reference: Database.md §3.1 (passwordHash field), SRS §19 (Security)
 */

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password.
 * @param {string} password
 * @returns {Promise<string>} bcrypt hash (≥60 chars)
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plaintext password against a stored hash.
 * @param {string} password - plaintext from request
 * @param {string} hash - stored bcrypt hash
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

module.exports = { hashPassword, comparePassword };
