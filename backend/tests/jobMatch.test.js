'use strict';

/**
 * Job Match Integration Tests — /api/v1/job-match & /api/v1/job-description
 *
 * Uses supertest and mongoose to test job description creation, file parsing, matching logic, caching, and soft deletes.
 *
 * Reference: Testing-Strategy.md, Phase 7 Spec
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/server');
const Resume = require('../src/models/Resume');
const User = require('../src/models/User');
const JobDescription = require('../src/models/JobDescription');
const JobMatch = require('../src/models/JobMatch');

const USER_MATCH_A = {
  fullName: 'John Matcher',
  email: 'john.match@example.com',
  password: 'PasswordJohn123'
};

const USER_MATCH_B = {
  fullName: 'Alice Security',
  email: 'alice.sec@example.com',
  password: 'PasswordAlice123'
};

let tokenA;
let tokenB;
let userIdA;
let userIdB;
let resumeIdA;
let resumeIdB;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  // Clear test data
  await User.deleteMany({ email: { $in: [USER_MATCH_A.email, USER_MATCH_B.email] } });
  await Resume.deleteMany({});
  await JobDescription.deleteMany({});
  await JobMatch.deleteMany({});

  // 1. Create and log in John (User A)
  await request(app).post('/api/v1/auth/register').send(USER_MATCH_A);
  const loginResA = await request(app).post('/api/v1/auth/login').send({
    email: USER_MATCH_A.email,
    password: USER_MATCH_A.password
  });
  tokenA = loginResA.body.data.accessToken;
  userIdA = loginResA.body.data.user.id;

  // 2. Create and log in Alice (User B)
  await request(app).post('/api/v1/auth/register').send(USER_MATCH_B);
  const loginResB = await request(app).post('/api/v1/auth/login').send({
    email: USER_MATCH_B.email,
    password: USER_MATCH_B.password
  });
  tokenB = loginResB.body.data.accessToken;
  userIdB = loginResB.body.data.user.id;

  // 3. Create parsed resumes for both users
  const resumeA = await Resume.create({
    userId: userIdA,
    fileName: 'john_resume.pdf',
    fileSize: 1024,
    fileType: 'application/pdf',
    storageUrl: 'https://fake-url.com/resA.pdf',
    storageKey: 'uploads/resA.pdf',
    versionNumber: 1,
    parsedText: 'John Doe. Experienced React and Node.js Developer. Proficient in MongoDB, Git, HTML, CSS.',
    parsingStatus: 'Completed',
    analysisStatus: 'completed'
  });
  resumeIdA = resumeA._id;

  const resumeB = await Resume.create({
    userId: userIdB,
    fileName: 'alice_resume.pdf',
    fileSize: 1024,
    fileType: 'application/pdf',
    storageUrl: 'https://fake-url.com/resB.pdf',
    storageKey: 'uploads/resB.pdf',
    versionNumber: 1,
    parsedText: 'Alice Wonderland. Senior Java and Spring Boot Engineer. MySQL and Kubernetes.',
    parsingStatus: 'Completed',
    analysisStatus: 'completed'
  });
  resumeIdB = resumeB._id;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: [USER_MATCH_A.email, USER_MATCH_B.email] } });
  await Resume.deleteMany({});
  await JobDescription.deleteMany({});
  await JobMatch.deleteMany({});
  await mongoose.disconnect();
});

describe('Job Matching API Endpoints', () => {
  let jdIdA;
  let jobMatchUUID;

  describe('POST /api/v1/job-description/text', () => {
    it('should successfully create and extract details for a pasted text JD', async () => {
      const res = await request(app)
        .post('/api/v1/job-description/text')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          jobTitle: 'Frontend Engineer',
          companyName: 'Tech Giants',
          text: 'We are looking for a Frontend Engineer with React, Javascript, HTML, and CSS skills. 2+ years of experience required.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobDescription).toBeDefined();
      expect(res.body.data.jobDescription.jobTitle).toBe('Frontend Engineer');
      expect(res.body.data.jobDescription.extractedDetails.requiredSkills).toContain('React');
      jdIdA = res.body.data.jobDescription._id;
    });

    it('should reject text JDs that are too short (less than 50 chars)', async () => {
      const res = await request(app)
        .post('/api/v1/job-description/text')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          text: 'Short JD text.'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/job-match', () => {
    it('should successfully compare a resume and job description and create a Match record', async () => {
      const res = await request(app)
        .post('/api/v1/job-match')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          resumeId: resumeIdA,
          jobDescriptionId: jdIdA
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobMatch).toBeDefined();
      expect(res.body.data.jobMatch.overallScore).toBe(78); // from mock generator
      expect(res.body.data.jobMatch.matchedSkills).toContain('React');
      jobMatchUUID = res.body.data.jobMatch.jobMatchId;
    });

    it('should trigger cache HIT and reuse match on identical request parameters', async () => {
      // First count documents
      const countBefore = await JobMatch.countDocuments({ userId: userIdA });

      const res = await request(app)
        .post('/api/v1/job-match')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          resumeId: resumeIdA,
          jobDescriptionId: jdIdA
        });

      expect(res.status).toBe(201);
      expect(res.body.data.jobMatch.jobMatchId).toBe(jobMatchUUID);

      const countAfter = await JobMatch.countDocuments({ userId: userIdA });
      expect(countAfter).toBe(countBefore); // count remains same due to cache HIT
    });

    it('should restrict user B from matching using user A\'s resume', async () => {
      const res = await request(app)
        .post('/api/v1/job-match')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          resumeId: resumeIdA,
          jobDescriptionId: jdIdA
        });

      expect(res.status).toBe(404); // returns resume not found due to ownership check
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/job-match/history', () => {
    it('should list John\'s past matching records in paginated format', async () => {
      const res = await request(app)
        .get('/api/v1/job-match/history')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matches.length).toBeGreaterThan(0);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/v1/job-match/:id', () => {
    it('should fetch the details of a match', async () => {
      const res = await request(app)
        .get(`/api/v1/job-match/${jobMatchUUID}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobMatch.jobMatchId).toBe(jobMatchUUID);
    });

    it('should prevent Alice (User B) from viewing John\'s match', async () => {
      const res = await request(app)
        .get(`/api/v1/job-match/${jobMatchUUID}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/job-match/:id', () => {
    it('should successfully soft-delete a match record', async () => {
      const deleteRes = await request(app)
        .delete(`/api/v1/job-match/${jobMatchUUID}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(deleteRes.status).toBe(204);

      // Verify it is no longer retrievable
      const getRes = await request(app)
        .get(`/api/v1/job-match/${jobMatchUUID}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(getRes.status).toBe(404);
    });
  });
});
