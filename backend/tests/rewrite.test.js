'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/server');
const Resume = require('../src/models/Resume');
const User = require('../src/models/User');
const ResumeRewrite = require('../src/models/ResumeRewrite');

const USER_RW_A = {
  fullName: 'John Rewriter',
  email: 'john.rw@example.com',
  password: 'PasswordJohn123'
};

const USER_RW_B = {
  fullName: 'Alice Hack',
  email: 'alice.hack@example.com',
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
  await User.deleteMany({ email: { $in: [USER_RW_A.email, USER_RW_B.email] } });
  await Resume.deleteMany({});
  await ResumeRewrite.deleteMany({});

  // 1. Create and log in User A
  await request(app).post('/api/v1/auth/register').send(USER_RW_A);
  const loginResA = await request(app).post('/api/v1/auth/login').send({
    email: USER_RW_A.email,
    password: USER_RW_A.password
  });
  tokenA = loginResA.body.data.accessToken;
  userIdA = loginResA.body.data.user.id;

  // 2. Create and log in User B
  await request(app).post('/api/v1/auth/register').send(USER_RW_B);
  const loginResB = await request(app).post('/api/v1/auth/login').send({
    email: USER_RW_B.email,
    password: USER_RW_B.password
  });
  tokenB = loginResB.body.data.accessToken;
  userIdB = loginResB.body.data.user.id;

  // 3. Create resumes
  const resA = await Resume.create({
    userId: userIdA,
    fileName: 'original_john.pdf',
    fileSize: 1024,
    fileType: 'application/pdf',
    storageUrl: 'https://fake-url.com/j.pdf',
    storageKey: 'uploads/john_orig.pdf',
    versionNumber: 1,
    parsedText: 'Experienced Node.js engineer.',
    parsingStatus: 'Completed',
    sections: {
      summary: 'Experienced Node.js engineer.',
      skills: ['Node.js', 'Express']
    }
  });
  resumeIdA = resA._id;

  const resB = await Resume.create({
    userId: userIdB,
    fileName: 'original_alice.pdf',
    fileSize: 1024,
    fileType: 'application/pdf',
    storageUrl: 'https://fake-url.com/a.pdf',
    storageKey: 'uploads/alice_orig.pdf',
    versionNumber: 1,
    parsedText: 'Alice frontend dev.',
    parsingStatus: 'Completed'
  });
  resumeIdB = resB._id;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: [USER_RW_A.email, USER_RW_B.email] } });
  await Resume.deleteMany({});
  await ResumeRewrite.deleteMany({});
  await mongoose.disconnect();
});

describe('Resume Rewrite API Endpoints', () => {
  let rewriteUUID;

  describe('POST /api/v1/resume-rewrite', () => {
    it('should successfully trigger a rewrite for a resume section', async () => {
      const res = await request(app)
        .post('/api/v1/resume-rewrite')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          resumeId: resumeIdA,
          sectionName: 'Professional Summary',
          rewriteMode: 'Professional',
          originalContent: 'Experienced Node.js engineer.',
          improvements: ['Grammar', 'Impact Statements']
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rewrite).toBeDefined();
      expect(res.body.data.rewrite.rewrittenContent).toContain('[Rewritten - Mode: Professional]');
      rewriteUUID = res.body.data.rewrite.rewriteId;
    });

    it('should trigger cache HIT and reuse rewrite on identical parameters', async () => {
      const countBefore = await ResumeRewrite.countDocuments({ userId: userIdA });

      const res = await request(app)
        .post('/api/v1/resume-rewrite')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          resumeId: resumeIdA,
          sectionName: 'Professional Summary',
          rewriteMode: 'Professional',
          originalContent: 'Experienced Node.js engineer.',
          improvements: ['Grammar', 'Impact Statements']
        });

      expect(res.status).toBe(201);
      expect(res.body.data.rewrite.rewriteId).toBe(rewriteUUID);

      const countAfter = await ResumeRewrite.countDocuments({ userId: userIdA });
      expect(countAfter).toBe(countBefore);
    });

    it('should restrict user B from rewriting user A\'s resume', async () => {
      const res = await request(app)
        .post('/api/v1/resume-rewrite')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          resumeId: resumeIdA,
          sectionName: 'Professional Summary',
          rewriteMode: 'Professional',
          originalContent: 'Hack original content'
        });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/resume-rewrite/history', () => {
    it('should fetch paginated history for rewriter A', async () => {
      const res = await request(app)
        .get('/api/v1/resume-rewrite/history')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rewrites.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/resume-rewrite/accept', () => {
    it('should successfully clone resume and increment version on accept', async () => {
      const res = await request(app)
        .post('/api/v1/resume-rewrite/accept')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          rewriteId: rewriteUUID
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.resume).toBeDefined();
      expect(res.body.data.resume.versionNumber).toBe(2);

      const verified = await Resume.findOne({ userId: userIdA, versionNumber: 2 });
      expect(verified).toBeDefined();
      expect(verified.sections.summary).toContain('[Rewritten - Mode: Professional]');
    });

    it('should restrict user B from accepting user A\'s rewrite', async () => {
      const res = await request(app)
        .post('/api/v1/resume-rewrite/accept')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          rewriteId: rewriteUUID
        });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/resume-rewrite/:id', () => {
    it('should soft-delete rewrite record', async () => {
      const del = await request(app)
        .delete(`/api/v1/resume-rewrite/${rewriteUUID}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(del.status).toBe(204);
    });
  });
});
