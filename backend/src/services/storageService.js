'use strict';

/**
 * Storage Service — MVP local-disk storage for resume files.
 * In production (Phase 8+) this will be replaced by an R2/S3 provider.
 *
 * Exposes a provider-agnostic interface:
 *   save(filePath, userId)  → { storageKey, storageUrl }
 *   delete(storageKey)      → void
 *
 * Reference: env.js storage config, Architecture.md §7 (file storage)
 * Rule: async/await, never duplicate code (PROJECT_RULES.md)
 */

const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const config = require('../config/env');
const logger = require('../utils/logger');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Ensure uploads directory exists synchronously at module load time
if (!fsSync.existsSync(UPLOADS_DIR)) {
  fsSync.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ─── Local provider ───────────────────────────────────────────────────────────

/**
 * "Save" a file that multer has already written to disk.
 * For local storage this is a no-op beyond returning the key/url.
 *
 * @param {string} diskPath — absolute path where multer wrote the file
 * @param {string} _userId  — (unused by local; required by cloud providers)
 * @returns {{ storageKey: string, storageUrl: string }}
 */
const saveLocal = (diskPath, _userId) => {
  const storageKey = `uploads/${path.basename(diskPath)}`;
  // In local dev, expose via a static /uploads route served by Express
  const storageUrl = `/uploads/${path.basename(diskPath)}`;
  return { storageKey, storageUrl };
};

/**
 * Delete a locally stored file.
 *
 * @param {string} storageKey — e.g. "uploads/<uuid>.pdf"
 */
const deleteLocal = async (storageKey) => {
  const filePath = path.resolve(__dirname, '../../', storageKey);
  try {
    await fs.unlink(filePath);
    logger.info(`[storageService] Deleted local file: ${filePath}`);
  } catch (err) {
    // Non-fatal: log the error but don't throw — the DB record can still be removed
    logger.warn(`[storageService] Could not delete file "${filePath}": ${err.message}`);
  }
};

// ─── Provider router ──────────────────────────────────────────────────────────

const provider = config.storage?.provider || 'local';

const storageService = {
  /**
   * Persist a file and return addressable metadata.
   *
   * @param {string} diskPath — temporary path on disk (multer output)
   * @param {string} userId   — owning user id (used by cloud providers)
   * @returns {Promise<{ storageKey: string, storageUrl: string }>}
   */
  async save(diskPath, userId) {
    if (provider === 'local') {
      return saveLocal(diskPath, userId);
    }
    // Future: if (provider === 'r2') return saveR2(diskPath, userId);
    throw new Error(`Unknown storage provider: ${provider}`);
  },

  /**
   * Remove a previously saved file.
   *
   * @param {string} storageKey
   * @returns {Promise<void>}
   */
  async delete(storageKey) {
    if (provider === 'local') {
      return deleteLocal(storageKey);
    }
    // Future: if (provider === 'r2') return deleteR2(storageKey);
    logger.warn(`[storageService] Delete not implemented for provider "${provider}"`);
  },
};

module.exports = storageService;
