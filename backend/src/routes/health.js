'use strict';

/**
 * Health Check Route
 * Returns system health status including server, database, and environment info.
 *
 * GET /api/v1/health
 *
 * Reference: Implementation-Guide.md Phase 1 completion criteria,
 *            Deployment.md §9.5 smoke tests
 */

const express = require('express');
const mongoose = require('mongoose');
const { sendSuccess } = require('../utils/responseFormatter');

const router = express.Router();

/**
 * @route   GET /api/v1/health
 * @desc    Health check — verify server and database are operational
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;

  // Mongoose readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }[dbState] || 'unknown';

  const isHealthy = dbState === 1;

  const healthData = {
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '0.1.0',
    uptime: Math.floor(process.uptime()),
    services: {
      database: {
        status: dbStatus,
        connected: dbState === 1,
      },
      server: {
        status: 'running',
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: {
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        },
      },
    },
  };

  const statusCode = isHealthy ? 200 : 503;
  return sendSuccess(res, { statusCode, data: healthData });
});

module.exports = router;
