'use strict';

/**
 * Resume Integration Tests — /api/v1/resumes
 *
 * Uses mongodb-memory-server and supertest to test the full HTTP layer.
 * Reference: Implementation-Guide.md Phase 3 completion criteria
 */

const path = require('path');
const fs = require('fs');
const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/server');

// ── Test user ──────────────────────────────────────────────────────────────────
const TEST_USER = {
  fullName: 'Resume Tester',
  email: 'resume.tester@testexample.com',
  password: 'StrongPass1',
};

let accessToken;
let agent;
let uploadedResumeId;

// ── Minimal valid PDF buffer ───────────────────────────────────────────────────
// A real minimal PDF so pdf-parse can read it
const MINIMAL_PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
  '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
  '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n' +
  'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n' +
  '0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
);

// ── Setup / Teardown ──────────────────────────────────────────────────────────

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  agent = request.agent(app);

  // Register and log in to get an access token
  await agent.post('/api/v1/auth/register').send(TEST_USER);
  const res = await agent.post('/api/v1/auth/login').send({
    email: TEST_USER.email,
    password: TEST_USER.password,
  });
  accessToken = res.body?.data?.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
});

// ── POST /api/v1/resumes ──────────────────────────────────────────────────────

describe('POST /api/v1/resumes', () => {
  it('should upload a valid PDF and return 201', async () => {
    const res = await agent
      .post('/api/v1/resumes')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('resume', MINIMAL_PDF, {
        filename: 'test-resume.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.resume).toBeDefined();
    expect(res.body.data.resume.fileName).toBe('test-resume.pdf');
    expect(res.body.data.resume.fileType).toBe('application/pdf');
    expect(res.body.data.resume.versionNumber).toBe(1);

    uploadedResumeId = res.body.data.resume._id;
  });

  it('should reject upload with no file — 400', async () => {
    const res = await agent
      .post('/api/v1/resumes')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('versionLabel', 'no-file-test');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NO_FILE');
  });

  it('should reject an unsupported file type — 415', async () => {
    const txtBuffer = Buffer.from('This is a text file, not a resume.');
    const res = await agent
      .post('/api/v1/resumes')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('resume', txtBuffer, {
        filename: 'resume.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(415);
    expect(res.body.success).toBe(false);
  });

  it('should reject an oversized file — 413', async () => {
    // Create a buffer just over 5 MB
    const bigBuffer = Buffer.alloc(5_242_881, 'a');
    const res = await agent
      .post('/api/v1/resumes')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('resume', bigBuffer, {
        filename: 'huge-resume.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(413);
    expect(res.body.success).toBe(false);
  });

  it('should require authentication — 401', async () => {
    const res = await request(app)
      .post('/api/v1/resumes')
      .attach('resume', MINIMAL_PDF, {
        filename: 'test-resume.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(401);
  });
});

// ── GET /api/v1/resumes ───────────────────────────────────────────────────────

describe('GET /api/v1/resumes', () => {
  it('should return paginated list of resumes for the authenticated user', async () => {
    const res = await agent
      .get('/api/v1/resumes')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.resumes)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
  });

  it('should require authentication — 401', async () => {
    const res = await request(app).get('/api/v1/resumes');
    expect(res.status).toBe(401);
  });
});

// ── GET /api/v1/resumes/:resumeId ─────────────────────────────────────────────

describe('GET /api/v1/resumes/:resumeId', () => {
  it('should return the resume detail for the owner', async () => {
    const res = await agent
      .get(`/api/v1/resumes/${uploadedResumeId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.resume._id).toBe(uploadedResumeId);
  });

  it('should return 404 for a non-existent resumeId', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await agent
      .get(`/api/v1/resumes/${fakeId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  it('should return 400 for an invalid resumeId format', async () => {
    const res = await agent
      .get('/api/v1/resumes/not-an-objectid')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
  });
});

// ── DELETE /api/v1/resumes/:resumeId ─────────────────────────────────────────

describe('DELETE /api/v1/resumes/:resumeId', () => {
  it('should soft-delete the resume and return 204', async () => {
    const res = await agent
      .delete(`/api/v1/resumes/${uploadedResumeId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(204);
  });

  it('should return 404 when trying to delete an already-deleted resume', async () => {
    const res = await agent
      .delete(`/api/v1/resumes/${uploadedResumeId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  it('should no longer appear in the resume list after deletion', async () => {
    const res = await agent
      .get('/api/v1/resumes')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    const ids = res.body.data.resumes.map((r) => r._id);
    expect(ids).not.toContain(uploadedResumeId);
  });
});
