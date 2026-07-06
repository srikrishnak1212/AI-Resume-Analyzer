'use strict';

/**
 * AI Resume Analysis Integration Tests — /api/v1/analysis
 *
 * Uses supertest and mongoose to test full HTTP controllers and caching.
 *
 * Reference: Testing-Strategy.md §6
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/server');
const Resume = require('../src/models/Resume');
const Analysis = require('../src/models/Analysis');
const GeminiClient = require('../src/services/ai/GeminiClient');

// ── Test User Accounts ────────────────────────────────────────────────────────
const USER_A = {
  fullName: 'User Alice',
  email: 'alice.test@example.com',
  password: 'PasswordA123',
};

const USER_B = {
  fullName: 'User Bob',
  email: 'bob.test@example.com',
  password: 'PasswordB123',
};

let tokenA;
let tokenB;
let userIdA;
let userIdB;
let resumeIdA;
let resumeIdB;
let analysisIdA;
let agent;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  // Mock GeminiClient to introduce a delay for background processing tests
  GeminiClient.analyzeResume = async function (resumeText, parsedSections, options = {}) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return GeminiClient._generateMockAnalysis(resumeText, options.targetRole);
  };
  
  // Clear collections to guarantee isolation!
  const User = require('../src/models/User');
  await User.deleteMany({});
  await Resume.deleteMany({});
  await Analysis.deleteMany({});

  agent = request.agent(app);

  // 1. Create and log in Alice
  await agent.post('/api/v1/auth/register').send(USER_A);
  const loginResA = await agent.post('/api/v1/auth/login').send({
    email: USER_A.email,
    password: USER_A.password,
  });
  tokenA = loginResA.body.data.accessToken;
  userIdA = loginResA.body.data.user.id;

  // 2. Create and log in Bob
  await agent.post('/api/v1/auth/register').send(USER_B);
  const loginResB = await agent.post('/api/v1/auth/login').send({
    email: USER_B.email,
    password: USER_B.password,
  });
  tokenB = loginResB.body.data.accessToken;
  userIdB = loginResB.body.data.user.id;

  // 3. Create dummy parsed resumes in the DB for both users
  const resumeA = await Resume.create({
    userId: new mongoose.Types.ObjectId(userIdA),
    fileName: 'Alice_Resume.pdf',
    fileSize: 12345,
    fileType: 'application/pdf',
    storageUrl: 'http://localhost/alice.pdf',
    storageKey: 'resumes/alice.pdf',
    versionNumber: 1,
    parsedText: 'Alice has 5 years of software engineering experience. Strong React and Node.js skills.',
    sections: {
      contactInfo: { name: 'Alice', email: USER_A.email },
      summary: 'Experienced software engineer.',
      skills: ['React', 'Node.js'],
    },
    parsingStatus: 'Completed',
    analysisStatus: 'pending',
  });
  resumeIdA = resumeA._id.toString();

  const resumeB = await Resume.create({
    userId: new mongoose.Types.ObjectId(userIdB),
    fileName: 'Bob_Resume.pdf',
    fileSize: 54321,
    fileType: 'application/pdf',
    storageUrl: 'http://localhost/bob.pdf',
    storageKey: 'resumes/bob.pdf',
    versionNumber: 1,
    parsedText: 'Bob has 10 years of product management experience. Strong agile and scrum skills.',
    sections: {
      contactInfo: { name: 'Bob', email: USER_B.email },
      summary: 'Senior product manager.',
      skills: ['Agile', 'Scrum'],
    },
    parsingStatus: 'Completed',
    analysisStatus: 'pending',
  });
  resumeIdB = resumeB._id.toString();
});

afterAll(async () => {
  await Resume.deleteMany({});
  await Analysis.deleteMany({});
});

describe('AI Resume Analysis APIs', () => {
  describe('POST /api/v1/analysis/:resumeId - Trigger Analysis', () => {
    it('should reject unauthorized request with 401', async () => {
      const res = await request(app)
        .post(`/api/v1/analysis/${resumeIdA}`)
        .send();
      expect(res.status).toBe(401);
    });

    it('should reject if resumeId is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/analysis/invalid_object_id')
        .set('Authorization', `Bearer ${tokenA}`)
        .send();
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 if user attempts to analyze other user\'s resume', async () => {
      const res = await request(app)
        .post(`/api/v1/analysis/${resumeIdB}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send();
      expect(res.status).toBe(404);
    });

    it('should trigger and queue analysis successfully for own resume', async () => {
      const res = await request(app)
        .post(`/api/v1/analysis/${resumeIdA}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send();

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.analysis).toBeDefined();
      expect(res.body.data.analysis.status).toBe('pending');
      expect(res.body.data.analysis.resumeId).toBe(resumeIdA);

      analysisIdA = res.body.data.analysis.analysisId;

      // Verify that the resume status is set to processing
      const resume = await Resume.findById(resumeIdA);
      expect(resume.analysisStatus).toBe('processing');
    });

    it('should return existing pending/processing analysis job on duplicate trigger requests', async () => {
      const res = await request(app)
        .post(`/api/v1/analysis/${resumeIdA}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send();

      expect(res.status).toBe(201);
      expect(res.body.data.analysis.analysisId).toBe(analysisIdA);
    });
  });

  describe('GET /api/v1/analysis/:resumeId - Fetch Analysis Details', () => {
    it('should retrieve completed analysis details after background execution finishes', async () => {
      // Poll until completed (max 2 seconds under Jest scheduling overhead)
      let res;
      for (let i = 0; i < 40; i++) {
        res = await request(app)
          .get(`/api/v1/analysis/${resumeIdA}`)
          .set('Authorization', `Bearer ${tokenA}`)
          .send();
        
        if (res.status === 200 && res.body.data.analysis.status === 'completed') {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.analysis).toBeDefined();
      expect(res.body.data.analysis.status).toBe('completed');
      expect(res.body.data.analysis.overallScore).toBe(82);
      expect(res.body.data.analysis.cached).toBe(false);

      // Verify that the resume status is updated to completed
      const resume = await Resume.findById(resumeIdA);
      expect(resume.analysisStatus).toBe('completed');
    });

    it('should return 404 if Bob requests Alice\'s analysis details', async () => {
      const res = await request(app)
        .get(`/api/v1/analysis/${resumeIdA}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send();
      expect(res.status).toBe(404);
    });
  });

  describe('Intelligent Cache Hits checking', () => {
    it('should bypass calling Gemini and load instantly from cache for identical text resume', async () => {
      // Alice uploads a new resume version with exact same text content
      const resumeA2 = await Resume.create({
        userId: new mongoose.Types.ObjectId(userIdA), // Alice's ID
        fileName: 'Alice_Resume_v2.pdf',
        fileSize: 12345,
        fileType: 'application/pdf',
        storageUrl: 'http://localhost/alice2.pdf',
        storageKey: 'resumes/alice2.pdf',
        versionNumber: 2,
        parsedText: 'Alice has 5 years of software engineering experience. Strong React and Node.js skills.',
        sections: {
          contactInfo: { name: 'Alice', email: USER_A.email },
          summary: 'Experienced software engineer.',
          skills: ['React', 'Node.js'],
        },
        parsingStatus: 'Completed',
        analysisStatus: 'pending',
      });

      const res = await request(app)
        .post(`/api/v1/analysis/${resumeA2._id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send();

      // Check if it is completed instantly and loaded from cache
      expect(res.status).toBe(201);
      expect(res.body.data.analysis.status).toBe('completed');
      expect(res.body.data.analysis.cached).toBe(true);
    });
  });

  describe('GET /api/v1/analysis/history - Fetch Analysis History', () => {
    it('should retrieve a paginated history list of own completed analyses', async () => {
      const res = await request(app)
        .get('/api/v1/analysis/history')
        .set('Authorization', `Bearer ${tokenA}`)
        .query({ page: 1, limit: 10 })
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.analyses).toBeDefined();
      expect(res.body.data.analyses.length).toBeGreaterThan(0);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/v1/analysis/:analysisId - Soft Delete', () => {
    it('should block deletion of analysis from other users', async () => {
      const res = await request(app)
        .delete(`/api/v1/analysis/${analysisIdA}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send();
      expect(res.status).toBe(404);
    });

    it('should delete own analysis successfully and return 204', async () => {
      const res = await request(app)
        .delete(`/api/v1/analysis/${analysisIdA}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send();
      expect(res.status).toBe(204);

      // Verify that analysis is soft deleted from DB
      const dbAnalysis = await Analysis.findById(analysisIdA);
      expect(dbAnalysis.isDeleted).toBe(true);
      expect(dbAnalysis.deletedAt).toBeDefined();
    });

    it('should return 404 when trying to fetch the soft deleted analysis', async () => {
      const res = await request(app)
        .get(`/api/v1/analysis/${resumeIdA}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send();
      expect(res.status).toBe(404);
    });
  });
});
