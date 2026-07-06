'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/server');
const Resume = require('../src/models/Resume');
const User = require('../src/models/User');
const CoverLetter = require('../src/models/CoverLetter');

const USER_CL_A = {
  fullName: 'Ron Letterman',
  email: 'ron.cl@example.com',
  password: 'PasswordRon123'
};

const USER_CL_B = {
  fullName: 'Alice Steal',
  email: 'alice.steal@example.com',
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
  await User.deleteMany({ email: { $in: [USER_CL_A.email, USER_CL_B.email] } });
  await Resume.deleteMany({});
  await CoverLetter.deleteMany({});

  // 1. Create and log in User A
  await request(app).post('/api/v1/auth/register').send(USER_CL_A);
  const loginResA = await request(app).post('/api/v1/auth/login').send({
    email: USER_CL_A.email,
    password: USER_CL_A.password
  });
  tokenA = loginResA.body.data.accessToken;
  userIdA = loginResA.body.data.user.id;

  // 2. Create and log in User B
  await request(app).post('/api/v1/auth/register').send(USER_CL_B);
  const loginResB = await request(app).post('/api/v1/auth/login').send({
    email: USER_CL_B.email,
    password: USER_CL_B.password
  });
  tokenB = loginResB.body.data.accessToken;
  userIdB = loginResB.body.data.user.id;

  // 3. Create resumes
  const resA = await Resume.create({
    userId: userIdA,
    fileName: 'ron_resume.pdf',
    fileSize: 1024,
    fileType: 'application/pdf',
    storageUrl: 'https://fake-url.com/ron.pdf',
    storageKey: 'uploads/ron_orig.pdf',
    versionNumber: 1,
    parsedText: 'Experienced Software Engineer.',
    parsingStatus: 'Completed'
  });
  resumeIdA = resA._id;

  const resB = await Resume.create({
    userId: userIdB,
    fileName: 'steal_resume.pdf',
    fileSize: 1024,
    fileType: 'application/pdf',
    storageUrl: 'https://fake-url.com/steal.pdf',
    storageKey: 'uploads/steal_orig.pdf',
    versionNumber: 1,
    parsedText: 'Hack dev.',
    parsingStatus: 'Completed'
  });
  resumeIdB = resB._id;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: [USER_CL_A.email, USER_CL_B.email] } });
  await Resume.deleteMany({});
  await CoverLetter.deleteMany({});
  await mongoose.disconnect();
});

describe('Cover Letter API Endpoints', () => {
  let letterUUID;

  describe('POST /api/v1/cover-letter', () => {
    it('should successfully generate a cover letter based on resume and inputs', async () => {
      const res = await request(app)
        .post('/api/v1/cover-letter')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          resumeId: resumeIdA,
          companyName: 'Tech Innovators Inc.',
          jobTitle: 'Senior Node Developer',
          hiringManager: 'Dr. Jane Smith',
          tone: 'Formal',
          length: 'Medium'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coverLetter).toBeDefined();
      expect(res.body.data.coverLetter.coverLetterText).toContain('Jane Smith');
      letterUUID = res.body.data.coverLetter.coverLetterId;
    });

    it('should trigger cache HIT and reuse cover letter on identical inputs', async () => {
      const countBefore = await CoverLetter.countDocuments({ userId: userIdA });

      const res = await request(app)
        .post('/api/v1/cover-letter')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          resumeId: resumeIdA,
          companyName: 'Tech Innovators Inc.',
          jobTitle: 'Senior Node Developer',
          hiringManager: 'Dr. Jane Smith',
          tone: 'Formal',
          length: 'Medium'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.coverLetter.coverLetterId).toBe(letterUUID);

      const countAfter = await CoverLetter.countDocuments({ userId: userIdA });
      expect(countAfter).toBe(countBefore);
    });

    it('should restrict user B from using user A\'s resume for cover letters', async () => {
      const res = await request(app)
        .post('/api/v1/cover-letter')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          resumeId: resumeIdA, // User A's resume
          companyName: 'Tech Innovators Inc.',
          jobTitle: 'Senior Node Developer',
          tone: 'Formal',
          length: 'Medium'
        });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/cover-letter/history', () => {
    it('should fetch history list', async () => {
      const res = await request(app)
        .get('/api/v1/cover-letter/history')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coverLetters.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/cover-letter/:id', () => {
    it('should fetch specific cover letter details', async () => {
      const res = await request(app)
        .get(`/api/v1/cover-letter/${letterUUID}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coverLetter.coverLetterId).toBe(letterUUID);
    });

    it('should prevent user B from viewing user A\'s cover letter', async () => {
      const res = await request(app)
        .get(`/api/v1/cover-letter/${letterUUID}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/cover-letter/:id/download/pdf', () => {
    it('should stream cover letter as PDF attachment', async () => {
      const res = await request(app)
        .get(`/api/v1/cover-letter/${letterUUID}/download/pdf`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('attachment');
    });
  });

  describe('GET /api/v1/cover-letter/:id/download/docx', () => {
    it('should stream cover letter as DOCX attachment', async () => {
      const res = await request(app)
        .get(`/api/v1/cover-letter/${letterUUID}/download/docx`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(res.headers['content-disposition']).toContain('attachment');
    });
  });

  describe('DELETE /api/v1/cover-letter/:id', () => {
    it('should soft-delete cover letter record', async () => {
      const del = await request(app)
        .delete(`/api/v1/cover-letter/${letterUUID}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(del.status).toBe(204);
    });
  });
});
