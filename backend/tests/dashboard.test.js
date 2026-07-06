'use strict';

/**
 * Dashboard Foundation Integration Tests — /api/v1/dashboard
 *
 * Uses supertest and mongoose to test dashboard statistics and activity compiling.
 *
 * Reference: Testing-Strategy.md §6
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/server');
const Resume = require('../src/models/Resume');
const Analysis = require('../src/models/Analysis');
const User = require('../src/models/User');

const USER_A = {
  fullName: 'Alice Dashboard',
  email: 'alice.dash@example.com',
  password: 'PasswordAlice123'
};

const USER_B = {
  fullName: 'Bob Dashboard',
  email: 'bob.dash@example.com',
  password: 'PasswordBob123'
};

let tokenA;
let tokenB;
let userIdA;
let userIdB;
let resumeIdA;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  // Clear collections for clean state
  await User.deleteMany({ email: { $in: [USER_A.email, USER_B.email] } });
  await Resume.deleteMany({});
  await Analysis.deleteMany({});

  // 1. Create and log in Alice
  await request(app).post('/api/v1/auth/register').send(USER_A);
  const loginResA = await request(app).post('/api/v1/auth/login').send({
    email: USER_A.email,
    password: USER_A.password
  });
  tokenA = loginResA.body.data.accessToken;
  userIdA = loginResA.body.data.user.id;

  // 2. Create and log in Bob
  await request(app).post('/api/v1/auth/register').send(USER_B);
  const loginResB = await request(app).post('/api/v1/auth/login').send({
    email: USER_B.email,
    password: USER_B.password
  });
  tokenB = loginResB.body.data.accessToken;
  userIdB = loginResB.body.data.user.id;

  // 3. Create dummy data for Alice
  const resumeA = await Resume.create({
    userId: new mongoose.Types.ObjectId(userIdA),
    fileName: 'Alice_Resume.pdf',
    fileSize: 1024,
    fileType: 'application/pdf',
    storageUrl: 'http://localhost/alice.pdf',
    storageKey: 'resumes/alice.pdf',
    versionNumber: 1,
    parsingStatus: 'Completed',
    analysisStatus: 'completed'
  });
  resumeIdA = resumeA._id;

  await Analysis.create({
    resumeId: resumeA._id,
    userId: new mongoose.Types.ObjectId(userIdA),
    resumeHash: 'dummyhash123',
    aiModel: 'gemini-2.5-flash',
    atsScore: 85,
    grammarScore: 90,
    formattingScore: 80,
    skillsScore: 75,
    experienceScore: 70,
    educationScore: 90,
    projectsScore: 85,
    summaryScore: 80,
    overallScore: 82,
    strengths: ['Formatting'],
    weaknesses: ['Skills'],
    suggestions: ['Add React'],
    detectedSkills: ['JS'],
    missingSkills: ['TS'],
    recommendedKeywords: ['React'],
    analysisDuration: 1200,
    status: 'completed'
  });

  // Create secondary resume for Alice (to verify total count = 2)
  await Resume.create({
    userId: new mongoose.Types.ObjectId(userIdA),
    fileName: 'Alice_Resume_v2.docx',
    fileSize: 2048,
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    storageUrl: 'http://localhost/alice2.docx',
    storageKey: 'resumes/alice2.docx',
    versionNumber: 2,
    parsingStatus: 'Completed',
    analysisStatus: 'pending'
  });
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: [USER_A.email, USER_B.email] } });
  await Resume.deleteMany({});
  await Analysis.deleteMany({});
});

describe('Dashboard Foundation APIs', () => {
  describe('GET /api/v1/dashboard', () => {
    it('should reject unauthorized request with 401', async () => {
      const res = await request(app).get('/api/v1/dashboard');
      expect(res.status).toBe(401);
    });

    it('should compile Alice stats correctly', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userProfile).toBeDefined();
      expect(res.body.data.userProfile.fullName).toBe(USER_A.fullName);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.metrics.totalResumes).toBe(2);
      expect(res.body.data.metrics.totalAnalyses).toBe(1);
      expect(res.body.data.metrics.latestAtsScore).toBe(85);
      expect(res.body.data.metrics.latestOverallScore).toBe(82);
      expect(res.body.data.quickStatistics.averageAtsScore).toBe(85);
      expect(res.body.data.recentActivities.length).toBeGreaterThan(0);

      // Verify that the login activity is compiled
      const loginAct = res.body.data.recentActivities.find(act => act.type === 'login');
      expect(loginAct).toBeDefined();
    });

    it('should isolate Bob stats correctly (zero values initialized)', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics.totalResumes).toBe(0);
      expect(res.body.data.metrics.totalAnalyses).toBe(0);
      expect(res.body.data.metrics.latestAtsScore).toBeNull();
      expect(res.body.data.metrics.latestResume).toBeNull();
    });
  });

  describe('GET /api/v1/dashboard/recent', () => {
    it('should reject unauthorized request with 401', async () => {
      const res = await request(app).get('/api/v1/dashboard/recent');
      expect(res.status).toBe(401);
    });

    it('should retrieve recent uploads and analyses lists for Alice', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recentUploads).toBeDefined();
      expect(res.body.data.recentUploads.length).toBe(2);
      expect(res.body.data.recentAnalyses).toBeDefined();
      expect(res.body.data.recentAnalyses.length).toBe(1);
      expect(res.body.data.recentActivities).toBeDefined();
      expect(res.body.data.recentActivities.length).toBeGreaterThan(0);
    });

    it('should limit results using the limit query parameter', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent?limit=1')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recentUploads.length).toBe(1);
      expect(res.body.data.recentAnalyses.length).toBe(1);
      expect(res.body.data.recentActivities.length).toBe(1);
    });

    it('should fail validation if limit is invalid', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/recent?limit=-5')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
