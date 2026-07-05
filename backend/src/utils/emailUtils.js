'use strict';

/**
 * Email Utilities
 * Nodemailer wrappers for transactional emails.
 * Reference: SRS FR-03 (forgot password), Implementation-Guide.md Phase 2
 */

const transporter = require('../config/mailer');
const config = require('../config/env');
const logger = require('./logger');

/**
 * Send a password reset email with a time-limited link.
 * @param {string} to - recipient email
 * @param {string} token - plaintext reset token (NOT hashed)
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${config.frontendUrl}/reset-password/${token}`;

  const mailOptions = {
    from: `"${config.email.fromName}" <${config.email.from}>`,
    to,
    subject: 'Reset Your Password — AI Resume Analyser',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #0F172A;">Reset your password</h2>
        <p style="color: #475569;">
          You requested a password reset for your AI Resume Analyser account.
          Click the button below to create a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #4F46E5; color: white;
                  padding: 12px 24px; border-radius: 10px; text-decoration: none;
                  font-weight: 600; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #94A3B8; font-size: 13px;">
          If you didn't request this, you can safely ignore this email.
          Your password will not change.
        </p>
        <p style="color: #94A3B8; font-size: 12px;">
          Or copy this link: <a href="${resetUrl}" style="color: #4F46E5;">${resetUrl}</a>
        </p>
      </div>
    `,
    text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`[EMAIL] Password reset email sent to: ${to}`);
  } catch (error) {
    logger.error('[EMAIL] Failed to send password reset email:', error.message);
    throw error;
  }
};

/**
 * Send a welcome email after successful registration.
 * @param {string} to - recipient email
 * @param {string} fullName - user's full name
 * @returns {Promise<void>}
 */
const sendWelcomeEmail = async (to, fullName) => {
  const mailOptions = {
    from: `"${config.email.fromName}" <${config.email.from}>`,
    to,
    subject: 'Welcome to AI Resume Analyser',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #0F172A;">Welcome, ${fullName}! 🎉</h2>
        <p style="color: #475569;">
          Your account has been created successfully. You can now upload your resume
          and get instant AI-powered feedback.
        </p>
        <a href="${config.frontendUrl}/dashboard"
           style="display: inline-block; background: #4F46E5; color: white;
                  padding: 12px 24px; border-radius: 10px; text-decoration: none;
                  font-weight: 600; margin: 16px 0;">
          Go to Dashboard
        </a>
      </div>
    `,
    text: `Welcome ${fullName}! Get started: ${config.frontendUrl}/dashboard`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`[EMAIL] Welcome email sent to: ${to}`);
  } catch (error) {
    // Welcome email failure is non-critical — log but don't block registration
    logger.warn('[EMAIL] Failed to send welcome email:', error.message);
  }
};

module.exports = { sendPasswordResetEmail, sendWelcomeEmail };
