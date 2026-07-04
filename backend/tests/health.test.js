'use strict';

/**
 * Health Check Integration Test
 * Verifies the health endpoint returns expected shape and status.
 *
 * Reference: Implementation-Guide.md Phase 1 completion criteria
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/server');

// Mock mongoose connection readyState to simulate connected database
Object.defineProperty(mongoose.connection, 'readyState', {
  value: 1,
  writable: true,
  configurable: true,
});

describe('GET /api/v1/health', () => {
  afterAll(async () => {
    // Ensure all mongoose connections are closed cleanly
    await mongoose.connection.close();
  });

  it('should return 200 with status ok when server is running and database is connected', async () => {
    mongoose.connection.readyState = 1; // Simulate connected

    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.timestamp).toBeDefined();
    expect(res.body.data.environment).toBeDefined();
    expect(res.body.data.services).toBeDefined();
    expect(res.body.data.services.database.connected).toBe(true);
    expect(res.body.data.services.server.status).toBe('running');
  });

  it('should return 503 with status degraded when database is disconnected', async () => {
    mongoose.connection.readyState = 0; // Simulate disconnected

    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(true); // envelope is still a success response format, but status is degraded
    expect(res.body.data.status).toBe('degraded');
    expect(res.body.data.services.database.connected).toBe(false);
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
