'use strict';

/**
 * Health Check Integration Test
 * Reference: Implementation-Guide.md Phase 1 completion criteria
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/server');

describe('GET /api/v1/health', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should return 200 with status ok when database is connected', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.services.database.connected).toBe(true);
    expect(res.body.data.services.server.status).toBe('running');
  });

  it('should include X-Request-ID header in response', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
