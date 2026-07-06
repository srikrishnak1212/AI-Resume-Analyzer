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

// ── Jest Mocks for PDF/DOCX parsing ───────────────────────────────────────────
jest.mock('../src/services/parsing/pdfParser', () => ({
  parsePdf: jest.fn().mockImplementation((buffer) => {
    if (buffer.toString().includes('corrupted data')) {
      throw new Error('PDF parsing failed: Corrupted PDF file structure.');
    }
    return Promise.resolve({
      text: 'Hello, this is a mock parsed resume text containing experience and education.',
      pageCount: 1,
    });
  }),
}));

jest.mock('../src/services/parsing/docxParser', () => ({
  parseDocx: jest.fn().mockImplementation((buffer) => {
    if (buffer.toString().includes('corrupted data')) {
      throw new Error('DOCX parsing failed: Corrupted DOCX structure.');
    }
    return Promise.resolve({
      text: 'Hello, this is a mock parsed resume text from docx containing experience and education.',
      pageCount: 1,
    });
  }),
}));

// ── Test user ──────────────────────────────────────────────────────────────────
const TEST_USER = {
  fullName: 'Resume Tester',
  email: 'resume.tester@testexample.com',
  password: 'StrongPass1',
};

const SECOND_USER = {
  fullName: 'Second Tester',
  email: 'second.tester@testexample.com',
  password: 'StrongPass2',
};

let accessToken;
let secondAccessToken;
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

  // Register and log in primary user to get an access token
  await agent.post('/api/v1/auth/register').send(TEST_USER);
  const res = await agent.post('/api/v1/auth/login').send({
    email: TEST_USER.email,
    password: TEST_USER.password,
  });
  accessToken = res.body?.data?.accessToken;

  // Register and log in secondary user to get their access token
  await agent.post('/api/v1/auth/register').send(SECOND_USER);
  const secondRes = await agent.post('/api/v1/auth/login').send({
    email: SECOND_USER.email,
    password: SECOND_USER.password,
  });
  secondAccessToken = secondRes.body?.data?.accessToken;

  // Re-login primary user on the agent so its cookies are restored
  await agent.post('/api/v1/auth/login').send({
    email: TEST_USER.email,
    password: TEST_USER.password,
  });
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

// ── Resume Parsing Endpoints ──────────────────────────────────────────────────

describe('Resume Parsing Endpoints', () => {
  it('should trigger parsing and wait for async completion', async () => {
    let status = 'Pending';
    // Poll the resume status until it resolves
    for (let i = 0; i < 15; i++) {
      const res = await agent
        .get(`/api/v1/resumes/${uploadedResumeId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      status = res.body.data.resume.parsingStatus;
      if (status === 'Completed' || status === 'Failed') {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    expect(status).toBe('Completed');
  });

  it('should retrieve parsed content for the owner', async () => {
    const res = await agent
      .get(`/api/v1/resumes/${uploadedResumeId}/parsed-content`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.parsingStatus).toBe('Completed');
    expect(res.body.data.parsedText).toBeDefined();
    expect(res.body.data.sections).toBeDefined();
  });

  it('should reject parsed content retrieval for a non-owner — 404', async () => {
    const res = await request(app)
      .get(`/api/v1/resumes/${uploadedResumeId}/parsed-content`)
      .set('Authorization', `Bearer ${secondAccessToken}`);

    expect(res.status).toBe(404);
  });

  it('should trigger manual re-parse for the owner', async () => {
    const res = await agent
      .post(`/api/v1/resumes/${uploadedResumeId}/parse`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.parsingStatus).toBe('Pending');
  });

  it('should reject manual re-parse trigger for a non-owner — 404', async () => {
    const res = await request(app)
      .post(`/api/v1/resumes/${uploadedResumeId}/parse`)
      .set('Authorization', `Bearer ${secondAccessToken}`);

    expect(res.status).toBe(404);
  });

  it('should handle parsing failure for a corrupted/empty file', async () => {
    const corruptedPdf = Buffer.from('corrupted data');
    const uploadRes = await agent
      .post('/api/v1/resumes')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('resume', corruptedPdf, {
        filename: 'corrupted.pdf',
        contentType: 'application/pdf',
      });

    expect(uploadRes.status).toBe(201);
    const corruptedId = uploadRes.body.data.resume._id;

    // Poll until status transitions to Failed
    let status = 'Pending';
    for (let i = 0; i < 15; i++) {
      const res = await agent
        .get(`/api/v1/resumes/${corruptedId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      status = res.body.data.resume.parsingStatus;
      if (status === 'Completed' || status === 'Failed') {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    expect(status).toBe('Failed');

    const detailsRes = await agent
      .get(`/api/v1/resumes/${corruptedId}/parsed-content`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(detailsRes.status).toBe(200);
    expect(detailsRes.body.data.parsingStatus).toBe('Failed');
    expect(detailsRes.body.data.parsingError).toBeDefined();
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
