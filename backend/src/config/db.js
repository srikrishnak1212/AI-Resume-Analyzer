'use strict';

/**
 * MongoDB Connection Configuration
 * Establishes and manages the Mongoose connection to MongoDB Atlas.
 *
 * Reference: Architecture.md §5, Implementation-Guide.md §6, Database.md §1
 */

const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

// ─── Connection options ────────────────────────────────────────────────────────
const MONGOOSE_OPTIONS = {
  // Write concern — require majority acknowledgment
  writeConcern: { w: 'majority' },

  // Retry writes on network errors
  retryWrites: true,

  // Connection pool
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,

  // Auto-index in development only (disable in production for performance)
  autoIndex: config.isDevelopment,
};

// ─── Connection state tracking ─────────────────────────────────────────────────
let isConnected = false;

/**
 * Connect to MongoDB Atlas.
 * Idempotent — safe to call multiple times (e.g., in tests).
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  if (isConnected) {
    logger.info('[DB] Already connected to MongoDB');
    return;
  }

  try {
    const conn = await mongoose.connect(config.mongodbUri, MONGOOSE_OPTIONS);
    isConnected = true;
    logger.info(`[DB] Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    logger.error('[DB] MongoDB connection failed:', error.message);
    // Exit process on initial connection failure — let the process manager restart
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB.
 * Used in tests and graceful shutdown.
 *
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('[DB] Disconnected from MongoDB');
  } catch (error) {
    logger.error('[DB] MongoDB disconnect error:', error.message);
  }
};

// ─── Mongoose connection event listeners ───────────────────────────────────────
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('[DB] MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  logger.info('[DB] MongoDB reconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('[DB] MongoDB connection error:', error.message);
});

module.exports = { connectDB, disconnectDB };
