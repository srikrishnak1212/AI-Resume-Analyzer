'use strict';

/**
 * Environment Variable Configuration & Validation
 * Validates all required environment variables on application startup.
 * Fail-fast: if a required variable is missing, the server will not start.
 *
 * Reference: Architecture.md §4.2, Implementation-Guide.md §1 (Phase 1)
 */

require('dotenv').config();

// ─── Required variables ───────────────────────────────────────────────────────
const REQUIRED_VARS = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

// ─── Validation ───────────────────────────────────────────────────────────────
const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('[ENV] Missing required environment variables:');
  missing.forEach((key) => console.error(`  - ${key}`));
  console.error('[ENV] Copy .env.example to .env and fill in the required values.');
  process.exit(1);
}

// ─── Exported config object ───────────────────────────────────────────────────
const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || 'v1',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',

  // Database
  mongodbUri: process.env.MONGODB_URI,

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // AI
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
    fallbackModel: process.env.GEMINI_FALLBACK_MODEL || 'gemini-1.5-flash',
  },

  // Storage
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    r2: {
      accountId: process.env.R2_ACCOUNT_ID || '',
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      bucketName: process.env.R2_BUCKET_NAME || '',
      publicUrl: process.env.R2_PUBLIC_URL || '',
    },
  },

  // Email
  email: {
    provider: process.env.EMAIL_PROVIDER || 'resend',
    resendApiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    fromName: process.env.EMAIL_FROM_NAME || 'AI Resume Analyser',
  },

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    aiMax: parseInt(process.env.RATE_LIMIT_AI_MAX_REQUESTS, 10) || 3,
    authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS, 10) || 5,
  },

  // Sentry
  sentryDsn: process.env.SENTRY_DSN || '',

  // Redis (Phase 2+)
  redis: {
    url: process.env.REDIS_URL || '',
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL || '',
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  },
};

module.exports = config;
