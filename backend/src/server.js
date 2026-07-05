'use strict';

/**
 * Express Application Entry Point
 * Configures all middleware, routes, and starts the HTTP server.
 *
 * Architecture: Request → requestId → Helmet → CORS → Morgan → rateLimiter
 *               → Routes → 404 handler → errorHandler
 *
 * Reference: Architecture.md §4, Implementation-Guide.md Phase 1,
 *            SRS §19 (Security), SRS §20 (Performance)
 */

const config = require('./config/env'); // Load & validate env vars first
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { connectDB } = require('./config/db');
const logger = require('./utils/logger');
const requestId = require('./middlewares/requestId');
const { generalLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const apiRouter = require('./routes/index');

// ─── App instance ──────────────────────────────────────────────────────────────
const app = express();

// ─── Security Headers (Helmet) ─────────────────────────────────────────────────
// Reference: Architecture.md §14 (Security Architecture — Helmet)
app.use(
  helmet({
    // Allow cross-origin requests from the frontend (needed for fonts, assets)
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: config.isProduction
      ? undefined
      : false, // Disable CSP in dev for hot-reload
  })
);

// ─── CORS ──────────────────────────────────────────────────────────────────────
// Reference: SRS §19 — restrict to deployed frontend domain(s)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      config.frontendUrl,
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`[CORS] Rejected origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy.`));
    }
  },
  credentials: true, // Allow cookies (HTTP-only refresh token)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'RateLimit-Limit', 'RateLimit-Remaining'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes

// ─── Request ID ────────────────────────────────────────────────────────────────
app.use(requestId);

// ─── Request Logging (Morgan) ─────────────────────────────────────────────────
// Production: combined format → structured log aggregation
// Development: dev format → concise colorized output
if (!config.isTest) {
  app.use(
    morgan(config.isProduction ? 'combined' : 'dev', {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    })
  );
}

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' })); // JSON payloads (JD text can be large)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Cookie Parser ─────────────────────────────────────────────────────────────
// Required for reading the HTTP-only refresh token cookie
app.use(cookieParser());

// ─── Global Rate Limiting ─────────────────────────────────────────────────────
// Reference: API.md §18 — per-IP rate limiting on all routes
app.use(`/api/${config.apiVersion}`, generalLimiter);

// ─── API Routes ────────────────────────────────────────────────────────────────
// All routes are prefixed with /api/v1
// Reference: API.md §1.3 (versioning)
app.use(`/api/${config.apiVersion}`, apiRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
// Catches all routes not matched by the API router
app.use(notFound);

// ─── Centralized Error Handler ─────────────────────────────────────────────────
// MUST be last middleware registered
app.use(errorHandler);

// ─── Server Startup ────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    const server = app.listen(config.port, () => {
      logger.info(`[SERVER] AI Resume Analyser API running on port ${config.port}`);
      logger.info(`[SERVER] Environment: ${config.env}`);
      logger.info(`[SERVER] Health check: http://localhost:${config.port}/api/${config.apiVersion}/health`);
    });

    // ─── Graceful Shutdown ─────────────────────────────────────────────────────
    const gracefulShutdown = async (signal) => {
      logger.info(`[SERVER] ${signal} received — shutting down gracefully`);
      server.close(async () => {
        const { disconnectDB } = require('./config/db');
        await disconnectDB();
        logger.info('[SERVER] Server closed. Goodbye.');
        process.exit(0);
      });

      // Force shutdown after 10s if graceful shutdown hangs
      setTimeout(() => {
        logger.error('[SERVER] Forced shutdown after timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      logger.error('[SERVER] Unhandled Promise Rejection:', reason);
    });

    return server;
  } catch (error) {
    logger.error('[SERVER] Failed to start:', error.message);
    process.exit(1);
  }
};

// Start the server (not when imported by tests)
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
