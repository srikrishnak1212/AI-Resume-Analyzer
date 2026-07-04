'use strict';

/**
 * Winston Logger Configuration
 * Structured logging for development (colorized console) and production (JSON stdout).
 *
 * Reference: Architecture.md §17, Implementation-Guide.md §5.9
 *
 * Rules:
 * - Never log passwords, full JWT tokens, or resume plaintext content.
 * - Log every AI call, parse operation, and authentication event.
 */

const { createLogger, format, transports } = require('winston');
const config = require('../config/env');

const { combine, timestamp, errors, colorize, printf, json } = format;

// ─── Custom format for development ────────────────────────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}]: ${stack || message}${metaStr}`;
  })
);

// ─── Production format (JSON for log aggregation) ─────────────────────────────
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

// ─── Logger instance ──────────────────────────────────────────────────────────
const logger = createLogger({
  level: config.isDevelopment ? 'debug' : 'info',
  format: config.isDevelopment ? devFormat : prodFormat,
  transports: [
    new transports.Console({
      // Silence logs during tests unless DEBUG=true
      silent: config.isTest && !process.env.DEBUG,
    }),
  ],
  // Do not exit on handled exceptions
  exitOnError: false,
});

module.exports = logger;
