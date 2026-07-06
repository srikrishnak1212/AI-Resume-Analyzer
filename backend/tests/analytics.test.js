'use strict';

/**
 * Analytics Integration Tests — /api/v1/analytics
 *
 * Uses supertest and mongoose to test analytics summaries, history, trends, and comparisons.
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
  fullName: 'Alice Analytics',
  email: 'alice.anal@example.com',
  password: 'PasswordAlice123'
};

const USER_B = {
  fullName: 'Bob Analytics',
  email: 'bob.anal@example.com',
  password: 'PasswordBob123'
};

let tokenA;
let tokenB;
let userIdA;
let userIdB;
let resumeIdA1;
let resumeIdA2;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  // Clear test data
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

  // 3. Create Alice's Resumes and Analyses
  // Version 1
  const resumeA1 = await Resume.create({
    userId: new mongoose.Types.ObjectId(userIdA),
    fileName: 'Alice_Resume.pdf',
    fileSize: 1024,
    fileType: 'application/pdf',
    storageUrl: 'http://localhost/alice1.pdf',
    storageKey: 'resumes/alice1.pdf',
    versionNumber: 1,
    parsingStatus: 'Completed',
    analysisStatus: 'completed'
  });
  resumeIdA1 = resumeA1._id;

  await Analysis.create({
    resumeId: resumeA1._id,
    userId: new mongoose.Types.ObjectId(userIdA),
    resumeHash: 'hash1',
    aiModel: 'gemini-2.5-flash',
    atsScore: 70,
    grammarScore: 75,
    formattingScore: 65,
    skillsScore: 70,
    experienceScore: 60,
    educationScore: 80,
    projectsScore: 75,
    summaryScore: 70,
    overallScore: 70,
    strengths: ['Formatting'],
    weaknesses: ['Experience'],
    suggestions: ['Add internships'],
    detectedSkills: ['JS', 'React'],
    missingSkills: ['TS'],
    recommendedKeywords: ['React'],
    analysisDuration: 1000,
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000) // 1h ago
  });

  // Version 2
  const resumeA2 = await Resume.create({
    userId: new mongoose.Types.ObjectId(userIdA),
    fileName: 'Alice_Resume.pdf',
    fileSize: 1500,
    fileType: 'application/pdf',
    storageUrl: 'http://localhost/alice2.pdf',
    storageKey: 'resumes/alice2.pdf',
    versionNumber: 2,
    parsingStatus: 'Completed',
    analysisStatus: 'completed'
  });
  resumeIdA2 = resumeA2._id;

  await Analysis.create({
    resumeId: resumeA2._id,
    userId: new mongoose.Types.ObjectId(userIdA),
    resumeHash: 'hash2',
    aiModel: 'gemini-2.5-flash',
    atsScore: 80,
    grammarScore: 85,
    formattingScore: 80,
    skillsScore: 85,
    experienceScore: 75,
    educationScore: 90,
    projectsScore: 85,
    summaryScore: 80,
    overallScore: 82,
    strengths: ['Formatting', 'Skills'],
    weaknesses: ['None'],
    suggestions: ['Improve layout'],
    detectedSkills: ['JS', 'React', 'TS'],
    missingSkills: [],
    recommendedKeywords: [],
    analysisDuration: 1500,
    status: 'completed',
    createdAt: new Date()
  });
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: [USER_A.email, USER_B.email] } });
  await Resume.deleteMany({});
  await Analysis.deleteMany({});
});

describe('Analytics APIs', () => {
  describe('GET /api/v1/analytics - Overview summary', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/analytics');
      expect(res.status).toBe(401);
    });

    it('should compile Alice summary statistics accurately', async () => {
      const res = await request(app)
        .get('/api/v1/analytics')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalAnalyses).toBe(2);
      expect(res.body.data.totalResumes).toBe(2);
      // Averages: ATS = (70 + 80) / 2 = 75, Overall = (70 + 82) / 2 = 76
      expect(res.body.data.avgAtsScore).toBe(75);
      expect(res.body.data.avgOverallScore).toBe(76);
      expect(res.body.data.overallHealth).toBe('Excellent'); // latest overall = 82 >= 75
    });

    it('should isolate Bob stats correctly (zero statistics returned)', async () => {
      const res = await request(app)
        .get('/api/v1/analytics')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalAnalyses).toBe(0);
      expect(res.body.data.avgOverallScore).toBe(0);
      expect(res.body.data.overallHealth).toBe('N/A');
    });
  });

  describe('GET /api/v1/analytics/history - Paginated analyses list', () => {
    it('should return analysis history list for Alice', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/history')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.analyses).toBeDefined();
      expect(res.body.data.analyses.length).toBe(2);
      expect(res.body.data.analyses[0].versionNumber).toBe(2); // Sorted desc
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(2);
    });

    it('should filter history by score parameters', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/history')
        .set('Authorization', `Bearer ${tokenA}`)
        .query({ minScore: 80 });

      expect(res.status).toBe(200);
      expect(res.body.data.analyses.length).toBe(1);
      expect(res.body.data.analyses[0].overallScore).toBe(82);
    });
  });

  describe('GET /api/v1/analytics/trends - Version score timeline', () => {
    it('should compile Alice trends sorted ascending', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/trends')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].versionNumber).toBe(1); // Version 1 first
      expect(res.body.data[1].versionNumber).toBe(2); // Version 2 second
    });
  });

  describe('GET /api/v1/analytics/comparison/:resumeId - Score comparison delta', () => {
    it('should calculate comparison metrics between Alice version 2 and version 1', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/comparison/${resumeIdA2}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current.versionNumber).toBe(2);
      expect(res.body.data.previous.versionNumber).toBe(1);
      expect(res.body.data.deltas.overallScore).toBe(12); // 82 - 70 = 12
      expect(res.body.data.deltas.atsScore).toBe(10); // 80 - 70 = 10
      expect(res.body.data.improvements.length).toBeGreaterThan(0);
    });

    it('should fail if unauthorized user (Bob) tries to compare Alice\'s resume', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/comparison/${resumeIdA2}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/analytics/skills - Skills Radar & Keywords list', () => {
    it('should retrieve compiled radar and keyword statistics for Alice', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/skills')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.detectedSkills.length).toBe(3); // JS, React, TS
      expect(res.body.data.radarChartData).toBeDefined();
      expect(res.body.data.radarChartData.length).toBe(5);
      
      const techSkills = res.body.data.radarChartData.find(dim => dim.name === 'Technical Skills');
      expect(techSkills.value).toBe(85); // Mapped to skillsScore of latest
    });
  });
});
