'use strict';

/**
 * Report Integration Tests — /api/v1/reports
 *
 * Uses supertest and mongoose to test report list, details, download, regeneration, and deletion.
 *
 * Reference: Testing-Strategy.md, Phase 6C Spec
 */

const request = require('supertest');
const mongoose = require('mongoose');
const fs = require('fs');
const { app } = require('../src/server');
const Resume = require('../src/models/Resume');
const Analysis = require('../src/models/Analysis');
const User = require('../src/models/User');
const Report = require('../src/models/Report');

const USER_REP_A = {
  fullName: 'Ron Reports',
  email: 'ron.reports@example.com',
  password: 'PasswordRon123'
};

const USER_REP_B = {
  fullName: 'Sam Security',
  email: 'sam.security@example.com',
  password: 'PasswordSam123'
};

let tokenA;
let tokenB;
let userIdA;
let userIdB;
let analysisIdA;
let analysisIdB;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  // Clear test data
  await User.deleteMany({ email: { $in: [USER_REP_A.email, USER_REP_B.email] } });
  await Resume.deleteMany({});
  await Analysis.deleteMany({});
  await Report.deleteMany({});

  // 1. Create and log in Ron (User A)
  await request(app).post('/api/v1/auth/register').send(USER_REP_A);
  const loginResA = await request(app).post('/api/v1/auth/login').send({
    email: USER_REP_A.email,
    password: USER_REP_A.password
  });
  tokenA = loginResA.body.data.accessToken;
  userIdA = loginResA.body.data.user.id;

  // 2. Create and log in Sam (User B)
  await request(app).post('/api/v1/auth/register').send(USER_REP_B);
  const loginResB = await request(app).post('/api/v1/auth/login').send({
    email: USER_REP_B.email,
    password: USER_REP_B.password
  });
  tokenB = loginResB.body.data.accessToken;
  userIdB = loginResB.body.data.user.id;

  // 3. Create Ron's Resume and Analysis
  const resumeA = await Resume.create({
    userId: new mongoose.Types.ObjectId(userIdA),
    fileName: 'Ron_Resume.pdf',
    fileSize: 1200,
    fileType: 'application/pdf',
    storageUrl: 'http://localhost/ron.pdf',
    storageKey: 'resumes/ron.pdf',
    versionNumber: 1,
    parsingStatus: 'Completed',
    analysisStatus: 'completed'
  });

  const analysisA = await Analysis.create({
    resumeId: resumeA._id,
    userId: new mongoose.Types.ObjectId(userIdA),
    resumeHash: 'hashron',
    aiModel: 'gemini-2.5-flash',
    atsScore: 82,
    grammarScore: 80,
    formattingScore: 85,
    skillsScore: 78,
    experienceScore: 85,
    educationScore: 90,
    projectsScore: 80,
    summaryScore: 85,
    overallScore: 82,
    strengths: ['Formatting looks neat', 'Strong technical terminology'],
    weaknesses: ['Vague project impact numbers'],
    suggestions: ['Add quantitative outcomes in professional experience section.'],
    detectedSkills: ['Node.js', 'React', 'MongoDB'],
    missingSkills: ['Kubernetes'],
    recommendedKeywords: ['Docker'],
    analysisDuration: 1200,
    status: 'completed'
  });
  analysisIdA = analysisA._id;

  // 4. Create Sam's Resume and Analysis
  const resumeB = await Resume.create({
    userId: new mongoose.Types.ObjectId(userIdB),
    fileName: 'Sam_Resume.pdf',
    fileSize: 2000,
    fileType: 'application/pdf',
    storageUrl: 'http://localhost/sam.pdf',
    storageKey: 'resumes/sam.pdf',
    versionNumber: 1,
    parsingStatus: 'Completed',
    analysisStatus: 'completed'
  });

  const analysisB = await Analysis.create({
    resumeId: resumeB._id,
    userId: new mongoose.Types.ObjectId(userIdB),
    resumeHash: 'hashsam',
    aiModel: 'gemini-2.5-flash',
    atsScore: 65,
    grammarScore: 60,
    formattingScore: 60,
    skillsScore: 60,
    projectsScore: 60,
    experienceScore: 60,
    educationScore: 60,
    summaryScore: 60,
    overallScore: 65,
    analysisDuration: 1500,
    status: 'completed'
  });
  analysisIdB = analysisB._id;
});

afterAll(async () => {
  // Clean up DB
  await User.deleteMany({ email: { $in: [USER_REP_A.email, USER_REP_B.email] } });
  await Resume.deleteMany({});
  await Analysis.deleteMany({});
  await Report.deleteMany({});
});

describe('Report System Integration Tests', () => {
  let activeReportId;

  describe('POST /api/v1/reports — Generate Report', () => {
    it('should generate a new PDF and JSON report for a completed analysis', async () => {
      const res = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ analysisId: analysisIdA });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.report).toBeDefined();
      expect(res.body.data.report.status).toBe('Completed');
      expect(res.body.data.report.cached).toBe(true);
      
      activeReportId = res.body.data.report.reportId;
      
      // Verify files created on disk
      expect(fs.existsSync(res.body.data.report.pdfPath)).toBe(true);
      expect(fs.existsSync(res.body.data.report.jsonPath)).toBe(true);
    });

    it('should return cached report when generating again for the same analysis', async () => {
      const res = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ analysisId: analysisIdA });

      expect(res.status).toBe(201);
      expect(res.body.data.report.reportId).toBe(activeReportId);
      expect(res.body.data.report.cached).toBe(true);
    });

    it('should not allow generating a report for someone else\'s analysis', async () => {
      const res = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ analysisId: analysisIdA });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/reports — List Reports', () => {
    it('should list Ron\'s reports and return 200', async () => {
      const res = await request(app)
        .get('/api/v1/reports')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reports).toBeInstanceOf(Array);
      expect(res.body.data.reports.length).toBe(1);
      expect(res.body.data.reports[0].reportId).toBe(activeReportId);
    });
  });

  describe('GET /api/v1/reports/:reportId — Report Details', () => {
    it('should fetch details of Ron\'s report', async () => {
      const res = await request(app)
        .get(`/api/v1/reports/${activeReportId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.report.reportId).toBe(activeReportId);
    });

    it('should block Sam from viewing Ron\'s report details', async () => {
      const res = await request(app)
        .get(`/api/v1/reports/${activeReportId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/reports/download/pdf/:reportId — Download PDF', () => {
    it('should download PDF report and increment download counter', async () => {
      const res = await request(app)
        .get(`/api/v1/reports/download/pdf/${activeReportId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');

      // Verify counter incremented
      const report = await Report.findOne({ reportId: activeReportId });
      expect(report.downloadCount).toBe(1);
    });

    it('should block Sam from downloading Ron\'s PDF report', async () => {
      const res = await request(app)
        .get(`/api/v1/reports/download/pdf/${activeReportId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/reports/download/json/:reportId — Download JSON', () => {
    it('should download JSON file and return valid parsed JSON data', async () => {
      const res = await request(app)
        .get(`/api/v1/reports/download/json/${activeReportId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
      expect(res.body.evaluationMetrics.overallScore).toBe(82);
    });
  });

  describe('POST /api/v1/reports/regenerate/:reportId — Force Regenerate', () => {
    it('should force regenerate report files and set cached to false', async () => {
      const res = await request(app)
        .post(`/api/v1/reports/regenerate/${activeReportId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.report.cached).toBe(false);
      
      // Verify files still exist on disk
      expect(fs.existsSync(res.body.data.report.pdfPath)).toBe(true);
      expect(fs.existsSync(res.body.data.report.jsonPath)).toBe(true);
    });
  });

  describe('DELETE /api/v1/reports/:reportId — Delete Report', () => {
    it('should delete report and clear associated files on disk', async () => {
      const dbReport = await Report.findOne({ reportId: activeReportId });
      const pdfPath = dbReport.pdfPath;
      const jsonPath = dbReport.jsonPath;

      const res = await request(app)
        .delete(`/api/v1/reports/${activeReportId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(204);

      // Verify deleted in DB
      const checkDb = await Report.findOne({ reportId: activeReportId });
      expect(checkDb).toBeNull();

      // Verify files deleted on disk
      expect(fs.existsSync(pdfPath)).toBe(false);
      expect(fs.existsSync(jsonPath)).toBe(false);
    });
  });
});
