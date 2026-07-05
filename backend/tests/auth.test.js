'use strict';

/**
 * Auth Integration Tests — /api/v1/auth
 * Tests registration, login, token refresh, and logout flows.
 *
 * Uses mongodb-memory-server for an isolated, in-memory MongoDB instance.
 * Reference: Implementation-Guide.md Phase 2 completion criteria
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/server');

// ── Test data ─────────────────────────────────────────────────────────────────
const TEST_USER = {
  fullName: 'Riya Sharma',
  email: 'riya.sharma@testexample.com',
  password: 'StrongPass1',
};

let accessToken;
let agent;

beforeAll(async () => {
  // Connect mongoose to the in-memory DB started by globalSetup
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  agent = request.agent(app); // Persist cookies across requests
});

afterAll(async () => {
  await mongoose.disconnect();
});

// ── Register ──────────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/register', () => {
  it('should register a new user and return 201 with accessToken', async () => {
    const res = await agent
      .post('/api/v1/auth/register')
      .send(TEST_USER);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    expect(res.body.data.accessToken).toBeDefined();
    // Password should NEVER appear in the response
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.user.password).toBeUndefined();

    accessToken = res.body.data.accessToken;
  });

  it('should reject registration with duplicate email — 409', async () => {
    const res = await agent
      .post('/api/v1/auth/register')
      .send(TEST_USER);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_CONFLICT');
  });

  it('should reject registration with missing fields — 400', async () => {
    const res = await agent
      .post('/api/v1/auth/register')
      .send({ email: 'invalid@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject weak password — 400', async () => {
    const res = await agent
      .post('/api/v1/auth/register')
      .send({ fullName: 'Test User', email: 'new@test.com', password: 'weak' });

    expect(res.status).toBe(400);
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/login', () => {
  it('should login with valid credentials and return 200 with accessToken', async () => {
    const res = await agent
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(TEST_USER.email);

    accessToken = res.body.data.accessToken;
  });

  it('should reject invalid password — 401', async () => {
    const res = await agent
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: 'WrongPassword1' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should reject non-existent email — 401', async () => {
    const res = await agent
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'SomePass1' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should reject missing email — 400', async () => {
    const res = await agent
      .post('/api/v1/auth/login')
      .send({ password: 'StrongPass1' });

    expect(res.status).toBe(400);
  });
});

// ── Get Me ────────────────────────────────────────────────────────────────────
describe('GET /api/v1/auth/me', () => {
  it('should return current user when authenticated', async () => {
    const res = await agent
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(TEST_USER.email);
  });

  it('should return 401 without a token', async () => {
    const res = await agent.get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return 401 with a malformed token', async () => {
    const res = await agent
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not.a.real.token');

    expect(res.status).toBe(401);
  });
});

// ── Refresh Token ─────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/refresh-token', () => {
  it('should refresh tokens when a valid refresh cookie is present', async () => {
    // Re-login to get a fresh refresh cookie
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(loginRes.status).toBe(200);

    // Extract the refreshToken cookie from the Set-Cookie header
    const cookies = loginRes.headers['set-cookie'];
    expect(cookies).toBeDefined();

    const res = await request(app)
      .post('/api/v1/auth/refresh-token')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should return 401 when no refresh cookie is present', async () => {
    const res = await request(app).post('/api/v1/auth/refresh-token');
    expect(res.status).toBe(401);
  });
});

// ── Forgot Password (no-op in test env) ──────────────────────────────────────
describe('POST /api/v1/auth/forgot-password', () => {
  it('should return 200 regardless of whether email exists (no enumeration)', async () => {
    const res = await agent
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'ghost@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for invalid email format', async () => {
    const res = await agent
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
  });
});

// ── Logout ────────────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/logout', () => {
  it('should logout successfully when authenticated', async () => {
    // Re-login to get a valid token
    const loginRes = await agent.post('/api/v1/auth/login').send({
      email: TEST_USER.email,
      password: TEST_USER.password,
    });
    const token = loginRes.body.data.accessToken;

    const res = await agent
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out successfully.');
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(401);
  });
});
