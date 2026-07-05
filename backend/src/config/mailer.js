'use strict';

/**
 * Mailer Configuration
 * Configures and exports a Nodemailer transporter.
 * Reference: Implementation-Guide.md Phase 2, Deployment.md §2
 *
 * For MVP, Resend or SMTP credentials are used.
 * In test environment, the transporter is replaced with a no-op stub.
 */

const nodemailer = require('nodemailer');
const config = require('./env');
const logger = require('../utils/logger');

let transporter;

if (config.isTest) {
  // In test environment — use a no-op stub so no real emails are sent
  transporter = {
    sendMail: async (options) => {
      logger.info(`[MAILER] Test stub — email suppressed to: ${options.to}`);
      return { messageId: 'test-stub-message-id' };
    },
  };
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.resend.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || 'resend',
      pass: config.email.resendApiKey,
    },
  });

  // Verify connection in development
  if (config.isDevelopment && config.email.resendApiKey && config.email.resendApiKey !== 're_your_resend_api_key') {
    transporter.verify().then(() => {
      logger.info('[MAILER] SMTP connection verified');
    }).catch((err) => {
      logger.warn('[MAILER] SMTP connection failed — emails will not be sent:', err.message);
    });
  }
}

module.exports = transporter;
