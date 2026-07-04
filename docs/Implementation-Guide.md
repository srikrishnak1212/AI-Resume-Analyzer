# Implementation-Guide.md
# Implementation Guide
## AI Resume Analyzer & Career Assistant

**Document Version:** 1.0
**Document Type:** Step-by-Step Implementation Guide
**Reference:** SRS v1.0, Architecture v1.0, Database v1.0, API v1.0, UI-Guide v1.0, AI-Prompts v1.0, Development-Roadmap v1.0, Testing-Strategy v1.0, Deployment v1.0
**Audience:** Developer, AI Coding Assistant (Claude Code, Cursor, Windsurf, Google AI Studio)
**Status:** Ready for Implementation

---

## Table of Contents

1. Project Overview
2. Development Order
3. Phase-by-Phase Implementation
4. Frontend Tasks
5. Backend Tasks
6. Database Tasks
7. AI Tasks
8. Testing Tasks
9. Deployment Tasks
10. Git Workflow
11. Daily Development Plan
12. Coding Standards Reference
13. Acceptance Checklist

---

## 1. Project Overview

### 1.1 What We Are Building

The **AI Resume Analyzer & Career Assistant** is a production-grade SaaS web application. Users upload their resumes (PDF or DOCX), and the platform uses Google Gemini AI to deliver recruiter-quality feedback, ATS scores, job description matching, cover letter generation, interview preparation, and career roadmap recommendations — all through a polished, responsive dashboard.

### 1.2 Implementation Strategy

This guide converts all completed specification documents into an ordered, actionable development sequence. Every task is mapped to a specific document section so the developer always knows the source of truth for each decision.

**The implementation follows three principles:**

1. **Bottom-up:** Build the data layer and API before the UI. Never build a frontend component without its backend endpoint being tested and functional.
2. **Vertical slices:** Complete one feature end-to-end (backend → API → frontend) before starting the next. Avoid building all backend endpoints first and all frontend pages last — this delays integration feedback.
3. **Test as you go:** Write tests alongside the feature, not at the end. Each phase has a defined completion criterion that includes a passing test.

### 1.3 Document Reference Map

| What You Are Building | Source Document |
|---|---|
| User stories, features, scope | SRS.md |
| Page layouts, components, design tokens | UI-Guide.md |
| MongoDB schemas, indexes, relationships | Database.md |
| API endpoints, request/response contracts | API.md |
| Gemini prompts, JSON schemas, retry logic | AI-Prompts.md |
| Folder structure, service layers, architecture patterns | Architecture.md |
| Phase order, sprint planning, risk management | Development-Roadmap.md |
| Test cases, coverage targets, quality gates | Testing-Strategy.md |
| Deployment steps, environment variables, hosting | Deployment.md |

---

## 2. Development Order

Follow this exact sequence. Each step is a dependency for the step below it.
Phase 1: Project Setup
├── Repository initialization
├── Frontend scaffold (Vite + React + Tailwind)
├── Backend scaffold (Node.js + Express)
├── MongoDB Atlas connection
└── Health check endpoint
Phase 2: Authentication
├── User model + schema
├── Register API
├── Login API + JWT issuance
├── Refresh token API
├── Auth middleware
├── Logout API
├── Forgot/Reset password API
├── Register page (frontend)
├── Login page (frontend)
├── Auth context + axios interceptors
└── Protected route wrapper
Phase 3: Resume Management
├── Resume model + schema
├── File upload middleware (multer)
├── PDF parsing service (pdf-parse)
├── DOCX parsing service (mammoth)
├── Upload API
├── Resume list API
├── Resume detail API
├── Delete API
├── Upload page (frontend)
└── Resume history page (frontend)
Phase 4: AI Integration
├── AI abstraction layer
├── Gemini SDK configuration
├── Resume analysis prompt (AI-Prompts.md Prompt 1)
├── JSON schema validator (zod)
├── Retry logic
├── Analysis model + schema
├── Analysis API (trigger + retrieve)
├── Content-hash caching
└── Analysis results page (frontend)
Phase 5: Dashboard
├── Analytics summary API
├── Score progression API
├── PDF report generation service
├── Report API
├── Dashboard page (frontend)
├── Stats cards
├── Score charts (Recharts)
├── Progress line chart
└── PDF download button
Phase 6: Job Description Matching
├── JD model + schema
├── JD save API
├── JD match API (AI-Prompts.md Prompt 2)
├── Match result storage
└── Job Match page (frontend)
Phase 7: Resume Enhancement
├── Cover letter model + schema
├── Cover letter generation API (AI-Prompts.md Prompt 3)
├── Interview prep model + schema
├── Interview question API (AI-Prompts.md Prompt 4)
├── Resume rewrite API (AI-Prompts.md Prompt 5)
├── Career roadmap API (AI-Prompts.md Prompt 6)
├── Cover Letter page (frontend)
├── Interview Prep page (frontend)
├── Resume Rewrite page (frontend)
└── Career Roadmap section (frontend)
Phase 8: Profile & Settings
├── Profile update API
├── Avatar upload API
├── Settings preferences API
├── Password change API
├── Account deletion API
├── Profile page (frontend)
└── Settings page (frontend)
Phase 9: Testing
├── Backend unit tests (Jest)
├── Backend integration tests (Supertest)
├── Frontend unit tests (Vitest)
├── Manual cross-browser testing
└── Full end-to-end manual journey
Phase 10: Deployment
├── MongoDB Atlas production setup
├── Backend deploy (Railway/Render)
├── Frontend deploy (Vercel)
├── Environment variable verification
├── Smoke tests on production
└── Monitoring activation

---

## 3. Phase-by-Phase Implementation

---

### Phase 1 — Project Setup

**Objectives:** Establish the project repository, scaffolding, tooling, and verify all services connect before writing any feature code.

**Folders to Create:**
ai-resume-analyzer/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── charts/
│   │   │   └── upload/
│   │   ├── pages/
│   │   │   ├── Landing/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── ResumeAnalysis/
│   │   │   ├── JobMatch/
│   │   │   ├── CoverLetter/
│   │   │   ├── InterviewPrep/
│   │   │   ├── History/
│   │   │   └── Settings/
│   │   ├── routes/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   ├── parsing/
│   │   │   └── report/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── utils/
│   └── package.json
└── README.md

**Files to Create:**
- `backend/src/server.js` — Express app entry point
- `backend/src/config/db.js` — Mongoose connection
- `backend/src/config/env.js` — environment variable validation
- `backend/src/routes/health.js` — health check route
- `backend/.env` and `backend/.env.example`
- `frontend/.env` and `frontend/.env.example`
- `frontend/src/App.jsx` — root component
- `frontend/tailwind.config.js` — Tailwind configuration with design tokens from UI-Guide.md
- `frontend/vite.config.js`
- `.gitignore` (root level)
- `README.md`

**Dependencies — Backend:**
express, mongoose, dotenv, cors, helmet, morgan, express-rate-limit,
express-validator, bcryptjs, jsonwebtoken, nodemailer, multer,
pdf-parse, mammoth, @google/generative-ai, zod, winston, sentry/node,
uuid
Dev: `jest, supertest, nodemon`

**Dependencies — Frontend:**
react, react-dom, react-router-dom, axios, recharts, react-hot-toast,
@sentry/react, lucide-react
Dev: `vite, @vitejs/plugin-react, tailwindcss, autoprefixer, postcss, vitest, @testing-library/react`

**Documentation References:**
- Architecture.md §19 (folder structure)
- SRS.md §27 (suggested folder structure)
- Deployment.md §2 (environment setup)

**Completion Criteria:**
- [ ] `npm run dev` (frontend) starts on `localhost:5173` with no errors
- [ ] `npm run dev` (backend) starts on `localhost:5000` with "Connected to MongoDB" in logs
- [ ] `GET http://localhost:5000/api/v1/health` returns `200 OK` with `{ status: "ok" }`
- [ ] Git repository initialized with `main` and `develop` branches

---

### Phase 2 — Authentication

**Objectives:** Complete user registration, login, JWT lifecycle, password reset, and protected route enforcement.

**Files to Create:**

Backend:
- `src/models/User.js` — User Mongoose schema
- `src/models/RefreshToken.js` — Refresh token schema
- `src/controllers/authController.js`
- `src/services/authService.js`
- `src/routes/auth.js`
- `src/middlewares/auth.js` — JWT validation middleware
- `src/utils/jwtUtils.js` — token generation helpers
- `src/utils/emailUtils.js` — Nodemailer helpers
- `src/config/mailer.js`
- `tests/auth.test.js` — integration tests

Frontend:
- `src/pages/Auth/RegisterPage.jsx`
- `src/pages/Auth/LoginPage.jsx`
- `src/pages/Auth/ForgotPasswordPage.jsx`
- `src/pages/Auth/ResetPasswordPage.jsx`
- `src/context/AuthContext.jsx`
- `src/hooks/useAuth.js`
- `src/services/authService.js` — axios wrapper for auth API
- `src/routes/PrivateRoute.jsx`
- `src/components/common/Navbar.jsx`

**Documentation References:**
- Database.md — `users` and `refreshTokens` collections
- API.md §2 — all auth endpoints
- SRS.md FR-01, FR-02, FR-03

**Completion Criteria:**
- [ ] User can register, receive tokens, and reach `/dashboard`
- [ ] Login with wrong password returns error
- [ ] Expired access token is refreshed transparently
- [ ] `/dashboard` redirects to `/login` when unauthenticated
- [ ] All auth integration tests pass

---

### Phase 3 — Resume Management

**Objectives:** Enable authenticated file upload, parsing, storage, and history management.

**Files to Create:**

Backend:
- `src/models/Resume.js` — Resume Mongoose schema
- `src/controllers/resumeController.js`
- `src/services/resumeService.js`
- `src/services/parsing/pdfParser.js` — pdf-parse wrapper
- `src/services/parsing/docxParser.js` — mammoth wrapper
- `src/services/parsing/sectionExtractor.js` — section segmentation logic
- `src/services/storageService.js` — S3/cloud upload wrapper
- `src/middlewares/upload.js` — multer configuration
- `src/routes/resumes.js`
- `tests/resume.test.js`

Frontend:
- `src/pages/History/ResumeHistoryPage.jsx`
- `src/components/upload/UploadZone.jsx` — drag-and-drop
- `src/components/upload/UploadProgress.jsx`
- `src/components/common/ResumeCard.jsx`
- `src/services/resumeService.js` — axios wrapper

**Documentation References:**
- Database.md — `resumes` collection
- API.md §3 — resume endpoints
- SRS.md FR-04, FR-05, FR-20

**Completion Criteria:**
- [ ] PDF and DOCX upload works; parsed sections stored in MongoDB
- [ ] Files > 5MB rejected with `413`
- [ ] Wrong file type rejected with `415`
- [ ] Resume list shows only current user's resumes
- [ ] Delete removes the resume from the list

---

### Phase 4 — AI Integration

**Objectives:** Integrate Gemini AI for structured resume analysis with JSON validation, retry logic, and caching.

**Files to Create:**

Backend:
- `src/services/ai/aiProvider.js` — provider-agnostic AI interface
- `src/services/ai/geminiClient.js` — Gemini SDK configuration
- `src/services/ai/resumeAnalysisService.js` — Prompt 1 + execution
- `src/services/ai/responseValidator.js` — zod schema validation
- `src/services/ai/retryHandler.js` — exponential backoff retry
- `src/models/Analysis.js` — Analysis Mongoose schema
- `src/controllers/analysisController.js`
- `src/routes/analysis.js`
- `tests/analysis.test.js` — with Gemini mocked

Frontend:
- `src/pages/ResumeAnalysis/AnalysisResultsPage.jsx`
- `src/components/dashboard/ATSScoreCard.jsx`
- `src/components/dashboard/ScoreBreakdownCard.jsx`
- `src/components/charts/RadarChart.jsx` — Recharts wrapper
- `src/components/charts/BarChart.jsx`
- `src/components/common/LoadingSkeleton.jsx`
- `src/services/analysisService.js`

**Documentation References:**
- AI-Prompts.md — Prompt 1, JSON schema, validation rules
- Database.md — `analyses` collection
- API.md §4 — analysis endpoints
- Architecture.md §6 (AI service architecture), §8 (resume processing workflow)
- SRS.md FR-06, FR-07, FR-08, FR-09

**Completion Criteria:**
- [ ] Analysis triggered and all score fields returned and displayed
- [ ] Zod schema validation rejects malformed Gemini responses
- [ ] Retry logic fires up to 3 times before returning 503
- [ ] Same resume content returns cached result (no second Gemini call)
- [ ] Loading skeleton visible during 15–25 second processing window

---

### Phase 5 — Dashboard

**Objectives:** Build the main dashboard with statistics, score charts, progress tracking, and PDF report generation.

**Files to Create:**

Backend:
- `src/controllers/analyticsController.js`
- `src/services/analyticsService.js`
- `src/services/report/pdfReportService.js` — pdfkit or puppeteer
- `src/models/Report.js`
- `src/controllers/reportController.js`
- `src/routes/analytics.js`
- `src/routes/reports.js`
- `tests/analytics.test.js`
- `tests/report.test.js`

Frontend:
- `src/pages/Dashboard/DashboardPage.jsx`
- `src/components/dashboard/StatsCard.jsx`
- `src/components/dashboard/RecentResumes.jsx`
- `src/components/charts/LineChart.jsx` — score progression
- `src/components/common/EmptyState.jsx`
- `src/components/common/ThemeToggle.jsx`
- `src/context/ThemeContext.jsx`
- `src/services/analyticsService.js`
- `src/services/reportService.js`

**Documentation References:**
- API.md §8 (reports), §9 (analytics)
- UI-Guide.md — Dashboard section
- SRS.md FR-15, FR-16, FR-18, FR-19

**Completion Criteria:**
- [ ] Dashboard shows real stats (total resumes, best score, avg score)
- [ ] RadarChart, BarChart, LineChart render with real data
- [ ] Empty state shown for new users with a CTA to upload
- [ ] PDF report downloads with all analysis sections
- [ ] Dark/light mode toggle works and persists across page refresh

---

### Phase 6 — Job Description Matching

**Objectives:** Allow users to paste a job description and receive an AI-powered match score and gap analysis.

**Files to Create:**

Backend:
- `src/models/JobDescription.js`
- `src/controllers/jobDescriptionController.js`
- `src/services/jobDescriptionService.js`
- `src/services/ai/jdMatchService.js` — Prompt 2
- `src/routes/jobDescriptions.js`
- `tests/jobDescription.test.js`

Frontend:
- `src/pages/JobMatch/JobMatchPage.jsx`
- `src/components/dashboard/MatchScoreCard.jsx`
- `src/components/dashboard/KeywordChips.jsx`
- `src/services/jobDescriptionService.js`

**Documentation References:**
- AI-Prompts.md — Prompt 2 (JD match)
- Database.md — `jobDescriptions` collection
- API.md §5
- SRS.md FR-10

**Completion Criteria:**
- [ ] User can paste JD text and select a resume for matching
- [ ] Match score (0–100) displayed after AI processing
- [ ] Missing keywords listed with suggestions
- [ ] JDs saved and retrievable from history

---

### Phase 7 — Resume Enhancement

**Objectives:** Implement cover letter generation, interview question generation, resume rewrite suggestions, and career roadmap.

**Files to Create:**

Backend:
- `src/models/CoverLetter.js`
- `src/models/InterviewPrep.js`
- `src/controllers/coverLetterController.js`
- `src/controllers/interviewController.js`
- `src/services/ai/coverLetterService.js` — Prompt 3
- `src/services/ai/interviewService.js` — Prompt 4
- `src/services/ai/rewriteService.js` — Prompt 5
- `src/services/ai/careerRoadmapService.js` — Prompt 6
- `src/routes/coverLetters.js`
- `src/routes/interview.js`
- `tests/coverLetter.test.js`
- `tests/interview.test.js`

Frontend:
- `src/pages/CoverLetter/CoverLetterPage.jsx`
- `src/pages/InterviewPrep/InterviewPrepPage.jsx`
- `src/pages/ResumeAnalysis/RewriteSuggestionsSection.jsx`
- `src/components/dashboard/CareerRoadmapSection.jsx`
- `src/components/common/CopyButton.jsx`

**Documentation References:**
- AI-Prompts.md — Prompts 3, 4, 5, 6
- Database.md — `coverLetters`, `interviewPrep` collections
- API.md §6, §7
- SRS.md FR-11, FR-12, FR-13

**Completion Criteria:**
- [ ] Cover letter generated and reflects resume content + JD (if provided)
- [ ] Interview questions include both technical and behavioral categories
- [ ] Rewrite suggestions shown per-section alongside originals
- [ ] Career roadmap shows skills, certifications, and projects
- [ ] Copy-to-clipboard works for cover letter text

---

### Phase 8 — Profile & Settings

**Objectives:** Implement user profile management, theme persistence, and account settings.

**Files to Create:**

Backend:
- `src/controllers/profileController.js`
- `src/controllers/settingsController.js`
- `src/routes/profile.js`
- `src/routes/settings.js`
- `tests/profile.test.js`
- `tests/settings.test.js`

Frontend:
- `src/pages/Settings/ProfilePage.jsx`
- `src/pages/Settings/SettingsPage.jsx`
- `src/components/common/AvatarUpload.jsx`
- `src/components/settings/AccountTab.jsx`
- `src/components/settings/PreferencesTab.jsx`
- `src/components/settings/NotificationsTab.jsx`

**Documentation References:**
- API.md §10 (settings), §11 (notifications)
- Database.md — `users` collection (preferences sub-document)
- SRS.md FR-17, FR-18

**Completion Criteria:**
- [ ] Profile updates persist across sessions
- [ ] Avatar upload works and displays in navbar
- [ ] Theme preference saved server-side, applied on re-login
- [ ] Password change rejects wrong current password
- [ ] Account deletion soft-deletes and blocks subsequent login

---

### Phase 9 — Testing

**Objectives:** Achieve test coverage targets and complete manual cross-browser verification.

**Files to Create:**
- `backend/tests/__mocks__/gemini.js` — Gemini API mock
- `backend/tests/fixtures/sampleResume.pdf` — test fixture
- `backend/tests/fixtures/analysisResponse.json` — valid Gemini response fixture
- `backend/jest.config.js`
- `frontend/vitest.config.js`
- `frontend/src/__tests__/` — component test files

**Documentation References:**
- Testing-Strategy.md — all sections
- Development-Roadmap.md §Phase 9

**Completion Criteria:**
- [ ] Backend test coverage ≥ 70% (`npm test -- --coverage`)
- [ ] All 25 sample test cases from Testing-Strategy.md §10 pass
- [ ] No Critical or High severity bugs open
- [ ] Manual cross-browser testing complete (Chrome, Firefox, Edge, Safari)
- [ ] Manual mobile testing complete (375px, 768px)

---

### Phase 10 — Deployment

**Objectives:** Deploy to production and verify with smoke tests.

**Files to Create:**
- `backend/.node-version` — specifies Node 20 for Railway/Render
- `frontend/vercel.json` — rewrite rules + security headers + cache headers
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `CHANGELOG.md`

**Documentation References:**
- Deployment.md — all sections

**Completion Criteria:**
- [ ] Production URL loads the application
- [ ] Full smoke test suite passes on production
- [ ] Sentry receiving events
- [ ] UptimeRobot shows green

---

## 4. Frontend Tasks

### 4.1 Landing Page (`src/pages/Landing/LandingPage.jsx`)

- Hero section with headline, subheadline, and CTA buttons ("Get Started Free", "See How It Works")
- Features section: 6 feature cards (AI Analysis, ATS Score, Job Match, Cover Letter, Interview Prep, Career Roadmap)
- How It Works: 3-step process (Upload → Analyze → Improve)
- Testimonials section (placeholder for MVP)
- Footer with links
- Reference: UI-Guide.md Landing Page section

### 4.2 Authentication Pages

**RegisterPage:**
- Form fields: Full Name, Email, Password, Confirm Password
- Real-time validation (email format, password strength, match check)
- Submit calls `POST /api/v1/auth/register`
- On success: redirect to `/dashboard`
- Error states: duplicate email (409), server error (500)
- Link to Login page

**LoginPage:**
- Form fields: Email, Password
- "Remember me" checkbox (extends session duration)
- Forgot Password link → `/forgot-password`
- Submit calls `POST /api/v1/auth/login`
- On success: store tokens, redirect to `/dashboard`
- Error state: invalid credentials

**ForgotPasswordPage / ResetPasswordPage:**
- Email input → POST to forgot-password endpoint
- Success message: "Check your email for a reset link"
- Reset page: new password + confirm password fields

### 4.3 Dashboard (`src/pages/Dashboard/DashboardPage.jsx`)

- Stats cards: Total Resumes, Best ATS Score, Average Score, Improvement Since Last Upload
- Score Progression LineChart (x-axis: dates; y-axis: ATS score)
- Overall Score BarChart (all score dimensions for latest resume)
- Recent Resumes list (last 3 with ATS score badge and "View Analysis" link)
- "Upload New Resume" CTA button
- Reference: UI-Guide.md Dashboard section, SRS FR-09, FR-15, FR-19

### 4.4 Upload Page (`src/pages/History/UploadPage.jsx` or integrated into Dashboard)

- Drag-and-drop zone with file type labels (PDF, DOCX, max 5MB)
- File picker fallback button
- Client-side validation before upload (size, type)
- Upload progress bar
- Post-upload redirect to analysis results page
- Reference: UI-Guide.md Upload section, SRS FR-04, FR-20

### 4.5 Analysis Results Page (`src/pages/ResumeAnalysis/AnalysisResultsPage.jsx`)

- Overall ATS Score (large circular display or score card)
- Radar chart showing all score dimensions (ATS, Grammar, Formatting, Relevance, Completeness, Impact)
- Score breakdown cards per section
- Strengths list (green badges)
- Weaknesses list (orange badges)
- Missing Keywords chip list
- Section-by-section feedback (Summary, Experience, Education, Skills)
- "Rewrite Suggestions" button → triggers AI rewrite
- "Generate Cover Letter" button → navigates to Cover Letter page
- "Match Job Description" button → navigates to Job Match page
- Reference: UI-Guide.md Analysis section, AI-Prompts.md §JSON Schema

### 4.6 Reports Page (`src/pages/Dashboard/ReportsPage.jsx`)

- List of generated PDF reports with date and resume name
- "Download" button for each report
- "Generate New Report" button (for latest analysis)
- Reference: API.md §8

### 4.7 Profile & Settings (`src/pages/Settings/`)

- **ProfilePage:** Avatar, Name, Headline, Target Role, Location, LinkedIn URL — all editable
- **SettingsPage:** Three tabs:
  - Account: email display, change password, delete account
  - Preferences: theme (dark/light), default analysis depth
  - Notifications: email notifications toggle
- Reference: API.md §10, §11

---

## 5. Backend Tasks

### 5.1 Authentication (`src/routes/auth.js`)

Implement all endpoints from API.md §2:
- `POST /register` — validate → check duplicate → hash password → create user → issue tokens
- `POST /login` — validate → find user → compare password → issue tokens → store refresh token
- `POST /refresh-token` — validate refresh token → issue new access token
- `POST /logout` — delete refresh token from DB
- `POST /forgot-password` — generate reset token → hash → store on user → send email
- `POST /reset-password/:token` — validate token + expiry → hash new password → clear token
- `GET /me` — return authenticated user profile (protected)

### 5.2 Resume APIs (`src/routes/resumes.js`)

Implement all endpoints from API.md §3:
- `POST /upload` — multer → validate → parse → hash → store → return resumeId
- `GET /` — paginated list filtered by `req.user._id`
- `GET /:resumeId` — ownership check → return document
- `DELETE /:resumeId` — ownership check → soft delete
- `GET /:resumeId/content` — return parsed sections

### 5.3 AI APIs (`src/routes/analysis.js`)

- `POST /resumes/:resumeId/analysis` — ownership check → check cache → call Gemini → validate → persist → return
- `GET /resumes/:resumeId/analysis` — return latest analysis
- `GET /resumes/:resumeId/analysis/history` — return all versions

### 5.4 Report APIs (`src/routes/reports.js`)

- `POST /reports/generate` — generate PDF → upload to storage → save Report document
- `GET /reports` — list user's reports
- `GET /reports/:reportId/download` — stream PDF from storage

### 5.5 Profile APIs (`src/routes/profile.js`)

- `GET /profile` — return user profile fields
- `PATCH /profile` — update allowed fields only (whitelist: name, headline, targetRole, location, linkedinUrl)
- `POST /profile/avatar` — multer → validate image → upload to storage → update user.avatarUrl

### 5.6 Settings APIs (`src/routes/settings.js`)

- `PATCH /settings/preferences` — update theme, language, notification preferences
- `PATCH /settings/password` — verify current password → hash new → save
- `DELETE /settings/account` — soft delete (set `deletedAt`, `isActive: false`)

### 5.7 Middleware

| File | Purpose |
|---|---|
| `middlewares/auth.js` | Verify JWT, attach `req.user` |
| `middlewares/upload.js` | Multer config, file type/size validation |
| `middlewares/validate.js` | Run express-validator checks, return 400 on failure |
| `middlewares/rateLimiter.js` | express-rate-limit instances per endpoint group |
| `middlewares/errorHandler.js` | Global error handler, formats errors per API.md §13 |
| `middlewares/notFound.js` | 404 handler for unmatched routes |
| `middlewares/requestId.js` | Attach UUID to every request for log tracing |

### 5.8 Validation

Use `express-validator` for all POST/PATCH bodies. Define validators as separate files in `src/validators/`:
- `authValidator.js` — registration and login field rules
- `resumeValidator.js` — upload form validation
- `profileValidator.js` — profile update field rules
- `settingsValidator.js` — preferences and password change rules

Apply validators in the route: `router.post('/register', authValidator.register, validate, authController.register)`

### 5.9 Logging

Use `winston` with the following transports:
- Development: `Console` transport, `colorize: true`, level `debug`
- Production: `Console` transport (Railway/Render captures stdout), level `info`, format `json`

Log every AI call, parse operation, and authentication event. Never log passwords, full JWT tokens, or resume plaintext content.

---

## 6. Database Tasks

### 6.1 Collections

Create all Mongoose models corresponding to Database.md collections:

| Model File | Collection | Key Schema Notes |
|---|---|---|
| `User.js` | `users` | email unique, password hashed, preferences sub-doc, isActive boolean |
| `RefreshToken.js` | `refreshTokens` | token hashed, userId ref, expiresAt TTL index |
| `Resume.js` | `resumes` | userId ref, fileType enum (pdf/docx), parsedSections sub-doc, contentHash, deletedAt |
| `Analysis.js` | `analyses` | resumeId ref, userId ref, analysisType enum, scores sub-doc, full AI response |
| `JobDescription.js` | `jobDescriptions` | userId ref, jdText, matchResults sub-doc |
| `CoverLetter.js` | `coverLetters` | userId ref, resumeId ref, jdId ref (optional), content string |
| `InterviewPrep.js` | `interviewPrep` | userId ref, resumeId ref, questions array (type, question, tip) |
| `Report.js` | `reports` | userId ref, resumeId ref, analysisId ref, fileUrl, expiresAt |

### 6.2 Indexes

After defining models, ensure these indexes are created (as defined in Deployment.md §5.3):

```javascript
// In each model file or a separate indexing script
UserSchema.index({ email: 1 }, { unique: true });
ResumeSchema.index({ userId: 1, createdAt: -1 });
ResumeSchema.index({ contentHash: 1 });
AnalysisSchema.index({ resumeId: 1, createdAt: -1 });
AnalysisSchema.index({ userId: 1 });
RefreshTokenSchema.index({ token: 1 }, { unique: true });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### 6.3 Relationships

- All collections reference `users._id` via `userId` field (not embedded — separate collection per Database.md design)
- `analyses.resumeId` → `resumes._id`
- `coverLetters.resumeId` → `resumes._id`; `coverLetters.jdId` → `jobDescriptions._id` (optional)
- `reports.analysisId` → `analyses._id`
- Do not use Mongoose `populate()` in hot paths (list endpoints) — use projection to return only needed fields

### 6.4 Seed Data

For development: create a seed script (`backend/src/config/seed.js`) that:
- Creates 1 test user: `test@example.com` / `Password123!`
- Creates 2 sample resumes with parsed sections
- Creates 1 sample analysis with all score fields populated
- Run with `npm run seed` (add to `package.json` scripts)

### 6.5 Validation

Mongoose schema-level validation (defined in model files):
- Required fields marked `required: true`
- Enum fields use `enum: ['value1', 'value2']`
- Score fields: `min: 0, max: 100`
- String length limits: `maxlength: 10000` for JD text
- Email: `match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/`

---

## 7. AI Tasks

### 7.1 Gemini Integration (`src/services/ai/geminiClient.js`)

- Initialize the `GoogleGenerativeAI` SDK with `process.env.GEMINI_API_KEY`
- Configure model: `gemini-1.5-pro`
- Set generation config: `{ responseMimeType: "application/json", temperature: 0.3, maxOutputTokens: 4096 }`
- Export a `generateContent(prompt)` function that returns the parsed response text

### 7.2 Prompt Management

Each AI feature has its own service file in `src/services/ai/`:

| Service File | AI-Prompts.md Reference | Input | Output |
|---|---|---|---|
| `resumeAnalysisService.js` | Prompt 1 | parsed resume sections | analysis JSON |
| `jdMatchService.js` | Prompt 2 | resume text + JD text | match JSON |
| `coverLetterService.js` | Prompt 3 | resume + JD + user profile | cover letter text |
| `interviewService.js` | Prompt 4 | resume + target role | questions JSON |
| `rewriteService.js` | Prompt 5 | resume sections | rewrite JSON |
| `careerRoadmapService.js` | Prompt 6 | resume + target role | roadmap JSON |

Each service file:
1. Constructs the prompt by interpolating input data into the template from AI-Prompts.md
2. Calls `geminiClient.generateContent(prompt)`
3. Passes the raw response string to `responseValidator.validate(rawResponse, schema)`
4. Returns the validated, parsed JSON object
5. Does NOT contain retry logic (that is handled by the calling layer)

### 7.3 JSON Parsing (`src/services/ai/responseValidator.js`)
Input: raw string from Gemini
Steps:

Strip any accidental markdown code fences (json ... )
JSON.parse() the string
Validate against the zod schema for this analysis type
If invalid: throw a ValidationError (triggers retry)
If valid: return parsed object


### 7.4 Retry Logic (`src/services/ai/retryHandler.js`)
Function: withRetry(fn, maxAttempts = 3)
attempt = 1
loop:
try:
result = await fn()
return result
catch (error):
if attempt >= maxAttempts: throw error
if error is rate limit (429): wait exponentially (1s, 4s, 9s)
if error is server error (500/503): wait exponentially
if error is ValidationError: wait 1s (retry with same prompt)
attempt++

Usage: `const result = await withRetry(() => resumeAnalysisService.analyze(parsedSections))`

### 7.5 Caching (`src/services/ai/cacheService.js`)

For MVP: MongoDB-backed cache using the `analyses` collection.

Cache lookup logic in `analysisController.js`:
1. Compute `SHA-256` hash of resume `extractedText`
2. Query `analyses` collection: `{ resumeId, contentHash: resumeContentHash, analysisType: "resume_analysis" }`
3. If found and `createdAt` < 24 hours ago: return cached analysis
4. If not found or stale: call Gemini, persist result with `contentHash`, return fresh analysis

Phase 2: replace with Redis (`GETEX / SETEX`) using Upstash for sub-millisecond lookup.

---

## 8. Testing Tasks

### 8.1 Frontend Testing

**Setup:** Vitest + React Testing Library

Test files location: `frontend/src/__tests__/`

**What to test:**
- Utility functions in `src/utils/` (pure functions — easy to unit test)
- Custom hooks: `useAuth`, `useTheme`
- Form validation logic in registration and login forms
- `PrivateRoute` — renders children when authenticated; redirects when not
- `ThemeContext` — toggle updates theme; initial value from localStorage

**What NOT to unit test on the frontend:**
- Full page renders with real API calls (use integration/E2E tests for that)
- Third-party components (Recharts charts) — verify they render without crashing

### 8.2 Backend Testing

**Setup:** Jest + Supertest + `mongodb-memory-server` (or dedicated test Atlas cluster)

Test file organization:
backend/tests/
├── mocks/
│   └── gemini.js          # Mock Gemini SDK
├── fixtures/
│   ├── users.js           # Test user data
│   ├── resumes.js         # Sample resume objects
│   └── analysisResponse.json  # Valid Gemini response fixture
├── auth.test.js
├── resume.test.js
├── analysis.test.js
├── jobDescription.test.js
├── coverLetter.test.js
├── report.test.js
├── profile.test.js
└── settings.test.js

Each test file follows this pattern:
beforeAll: connect to test database
beforeEach: seed required test data
afterEach: clear test data
afterAll: disconnect from test database
describe('POST /api/v1/auth/register'):
it('returns 201 and tokens for valid input')
it('returns 409 for duplicate email')
it('returns 400 for missing required fields')
it('returns 400 for invalid email format')

**Gemini mock:** Return the fixture `analysisResponse.json` instead of calling the real API. Test retry logic by configuring the mock to fail N times before succeeding.

### 8.3 AI Testing

- Unit test `responseValidator.js` with valid and invalid JSON inputs
- Unit test `retryHandler.js` — mock `fn` to fail 1, 2, 3 times and verify retry count
- Integration test analysis endpoint with mocked Gemini returning: valid response, invalid JSON, rate limit error, server error

### 8.4 Database Testing

- Test each Mongoose model's validation: missing required fields → `ValidationError`
- Test unique constraints: duplicate email → MongoDB duplicate key error → caught as 409
- Test TTL index on `refreshTokens` (manually set a past `expiresAt` and verify the document is not returned in queries — TTL deletion is async so test the query filter, not the actual deletion)

### 8.5 Deployment Testing

After each deployment, run the smoke test checklist from Testing-Strategy.md §2.6:
1. `GET /api/v1/health` → `200 OK`
2. Register a new user → tokens received
3. Upload a PDF resume → parsed sections returned
4. Trigger analysis → analysis result displayed
5. Download PDF report → file opens correctly
6. Logout → tokens cleared; redirect to landing page

---

## 9. Deployment Tasks

Follow Deployment.md in full. Summary:

### 9.1 Frontend (Vercel)

1. Connect GitHub repo to Vercel
2. Set build command: `npm run build`, output: `dist`, root: `frontend/`
3. Add all `VITE_*` environment variables in Vercel dashboard
4. Add `vercel.json` with rewrite rule and cache headers
5. Connect custom domain; verify TLS

### 9.2 Backend (Railway or Render)

1. Connect GitHub repo
2. Set start command: `node src/server.js`
3. Add all backend environment variables
4. Configure health check path: `/api/v1/health`
5. Enable auto-restart on failure

### 9.3 Database (MongoDB Atlas)

1. Create production cluster (M10+)
2. Create database user with `readWrite` role
3. Allowlist backend deployment IP addresses
4. Enable automated backups and Continuous Cloud Backup
5. Run index creation (verify via Atlas UI → Collections → Indexes)

### 9.4 Environment Variables

Cross-check: every key in `.env.example` must have a value set in both Render/Railway and Vercel. No missing, no placeholder values.

### 9.5 Verification

Run full smoke test suite on production. Verify Sentry receives events. Confirm UptimeRobot is monitoring the health endpoint.

---

## 10. Git Workflow

### 10.1 Repository Structure
ai-resume-analyzer/           ← root (monorepo or single repo)
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── frontend/
├── backend/
├── .gitignore
├── README.md
└── CHANGELOG.md

Or two separate repositories (`ai-resume-frontend` and `ai-resume-backend`) linked by separate Vercel and Railway projects.

### 10.2 Branch Strategy

Consistent with Development-Roadmap.md §6:

| Branch | Purpose |
|---|---|
| `main` | Production only |
| `develop` | Integration |
| `feature/phase<N>-<description>` | Feature work |
| `fix/<description>` | Bug fixes |
| `chore/<description>` | Non-feature maintenance |
| `hotfix/<description>` | Emergency production patches |

### 10.3 Commit Convention

Follow Conventional Commits: `<type>(<scope>): <summary>`

Examples:
feat(auth): add JWT refresh token endpoint
feat(ai): integrate Gemini resume analysis prompt 1
fix(upload): reject scanned PDFs with empty text extraction
test(analysis): add retry logic integration test
chore: bump @google/generative-ai to 0.21.0
docs: update API.md with analysis history endpoint

Types: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `perf`, `style`

### 10.4 Release Strategy

Merge to `main` only at milestone boundaries (Development-Roadmap.md §5):
- `v0.1.0` — MVP complete (Phases 1–5)
- `v0.2.0` — Advanced features (Phases 6–7)
- `v0.3.0` — Profile & Settings (Phase 8)
- `v1.0.0` — Production launch (Phases 9–10 complete)

### 10.5 Version Tags

Create a git tag on `main` at each release:
git tag -a v1.0.0 -m "Production launch — all MVP features complete"
git push origin v1.0.0

---

## 11. Daily Development Plan

### Week 1 — Project Foundation & Authentication

| Day | Tasks |
|---|---|
| Day 1 | Repository setup, folder structure (SRS §27), Git branches, README |
| Day 2 | Backend scaffold: Express app, Mongoose connection, health check, environment config |
| Day 3 | Frontend scaffold: Vite + React + Tailwind, design tokens from UI-Guide.md, routing skeleton |
| Day 4 | User model, Register API, Login API, JWT issuance, bcrypt |
| Day 5 | Refresh token model + API, Logout API, auth middleware |
| Day 6 | Forgot/Reset password API, Nodemailer integration, auth integration tests |
| Day 7 | Frontend: Register page, Login page, AuthContext, axios interceptors, PrivateRoute |

**End of Week 1 Goal:** User can register, login, access a protected dashboard stub, and have their session refreshed transparently.

---

### Week 2 — Resume Upload & Parsing

| Day | Tasks |
|---|---|
| Day 8 | Resume model schema, multer middleware, file type/size validation |
| Day 9 | PDF parser service (pdf-parse), DOCX parser service (mammoth), section extractor |
| Day 10 | Storage service (S3 upload), Upload API endpoint, resume integration tests |
| Day 11 | Resume list API, Resume detail API, Delete API |
| Day 12 | Frontend: Upload page with drag-and-drop zone, file validation, progress indicator |
| Day 13 | Frontend: Resume History page, ResumeCard component, delete with confirmation |
| Day 14 | Buffer: fix bugs, test edge cases (scanned PDF, corrupted DOCX, zero-byte file) |

**End of Week 2 Goal:** User can upload PDF/DOCX, see parsed sections in the DB, and manage their resume history.

---

### Week 3 — AI Integration & Analysis

| Day | Tasks |
|---|---|
| Day 15 | AI abstraction layer, Gemini SDK client, provider interface (Architecture.md §6) |
| Day 16 | Resume analysis service — construct Prompt 1 from AI-Prompts.md, call Gemini |
| Day 17 | Zod schema validation for AI response, schema definitions matching AI-Prompts.md JSON schema |
| Day 18 | Retry handler with exponential backoff, content-hash caching logic |
| Day 19 | Analysis model, Analysis controller + route, analysis integration tests (with mocks) |
| Day 20 | Frontend: Analysis Results page, ATS Score card, RadarChart |
| Day 21 | Frontend: Score breakdown cards, Keywords section, strengths/weaknesses lists, loading skeleton |

**End of Week 3 Goal:** Full end-to-end analysis: upload resume → trigger analysis → Gemini returns JSON → validated → displayed on dashboard.

---

### Week 4 — Dashboard, Reports & Job Matching

| Day | Tasks |
|---|---|
| Day 22 | Analytics service (summary stats + progress data), Analytics API |
| Day 23 | PDF report service (pdfkit), Report model + API |
| Day 24 | Frontend: Dashboard page — stats cards, LineChart, BarChart, recent resumes |
| Day 25 | Frontend: Empty state, ThemeContext, dark/light toggle, theme persistence |
| Day 26 | JD model, JD save API, JD match service (Prompt 2), JD match API |
| Day 27 | Frontend: Job Match page — textarea, resume selector, match score display, keyword chips |
| Day 28 | Buffer: fix bugs, cross-browser testing of charts, PDF download verification |

**End of Week 4 Goal:** Dashboard fully functional with real data; PDF report downloadable; job description matching operational.

---

### Week 5 — Enhancement Features & Profile

| Day | Tasks |
|---|---|
| Day 29 | Cover letter service (Prompt 3), Cover Letter model + API |
| Day 30 | Interview prep service (Prompt 4), InterviewPrep model + API |
| Day 31 | Rewrite service (Prompt 5), Career roadmap service (Prompt 6), routes |
| Day 32 | Frontend: Cover Letter page — generate, display, copy, download |
| Day 33 | Frontend: Interview Prep page — technical + behavioral question lists |
| Day 34 | Frontend: Rewrite Suggestions section, Career Roadmap section |
| Day 35 | Profile API, Settings API, Frontend: Profile page, Settings page (3 tabs) |

**End of Week 5 Goal:** All enhancement features working; profile and settings pages complete.

---

### Week 6 — Testing, Hardening & Deployment

| Day | Tasks |
|---|---|
| Day 36 | Complete backend integration test suite — all endpoints, all error paths |
| Day 37 | Frontend unit tests — forms, hooks, PrivateRoute, ThemeContext |
| Day 38 | Manual cross-browser testing: Chrome, Firefox, Edge, Safari |
| Day 39 | Manual mobile testing (375px, 768px); fix responsive issues |
| Day 40 | Security hardening: CORS, Helmet, rate limiting, input validation audit |
| Day 41 | MongoDB Atlas production setup, index creation, backup configuration |
| Day 42 | Deploy backend to Railway/Render; deploy frontend to Vercel; run smoke tests; activate monitoring |

**End of Week 6 Goal:** Production live, all smoke tests passing, monitoring active, v1.0.0 tagged.

---

## 12. Coding Standards Reference

### 12.1 Architecture Pattern

Follow the strict Controller → Service → Model layering defined in Architecture.md §4:

- **Controllers** (`src/controllers/`) — handle HTTP req/res only. Extract input, call service, return response. No business logic.
- **Services** (`src/services/`) — contain all business logic. Orchestrate calls to models, AI layer, and storage. No Express objects (`req`, `res`).
- **Models** (`src/models/`) — Mongoose schemas only. No business logic beyond Mongoose validators and pre/post hooks.
- **AI Layer** (`src/services/ai/`) — isolated AI integration. No direct imports from controllers.

### 12.2 Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Files | camelCase | `authController.js`, `resumeService.js` |
| React components | PascalCase | `ATSScoreCard.jsx`, `UploadZone.jsx` |
| Variables | camelCase | `const userId`, `let parsedSections` |
| Constants | SCREAMING_SNAKE_CASE | `const MAX_FILE_SIZE = 5242880` |
| MongoDB collections | lowercase plural | `users`, `resumes`, `analyses` |
| Mongoose models | PascalCase singular | `User`, `Resume`, `Analysis` |
| API routes | lowercase, hyphenated | `/api/v1/cover-letters`, `/api/v1/job-descriptions` |
| Environment variables | SCREAMING_SNAKE_CASE | `GEMINI_API_KEY`, `JWT_ACCESS_SECRET` |

### 12.3 Folder Structure

Follow SRS.md §27 and Architecture.md §19 exactly. Do not create files in the root `src/` — everything belongs in a named subdirectory.

### 12.4 Error Handling

All backend errors must be thrown as structured error objects and caught by the global error handler middleware (`src/middlewares/errorHandler.js`). The error handler formats all responses per API.md §13:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email address is already registered.",
    "details": []
  }
}
```

Never return a stack trace in production responses. Catch all async errors with `try/catch` in controllers or use an `asyncHandler` wrapper.

### 12.5 Code Organization

- One concern per file: `authController.js` handles auth only; never mix resume logic into auth files
- Keep controllers thin: 10–30 lines per route handler
- Services can be longer but split logically if > 150 lines
- Import order: Node built-ins → third-party packages → internal modules
- Export style: named exports preferred; default exports for React components only

### 12.6 Documentation Expectations

- Every service function has a JSDoc comment:
```javascript
  /**
   * Analyzes a resume using Google Gemini AI.
   * @param {Object} parsedSections - The structured sections from the resume parser.
   * @returns {Promise<Object>} - Schema-validated analysis result.
   * @throws {AIServiceError} - If Gemini fails after all retries.
   */
```
- Every API route references the API.md section in a comment: `// API.md §3.1 — Upload Resume`
- `README.md` kept up to date with local setup steps

---

## 13. Acceptance Checklist

Use this checklist to verify the complete application before tagging `v1.0.0`.

### Authentication (SRS FR-01, FR-02, FR-03)
- [ ] User can register with email and password
- [ ] Duplicate email registration returns an error
- [ ] User can log in and receive a JWT
- [ ] Invalid credentials return a 401 error
- [ ] Forgot password email is sent and reset link works
- [ ] Logout clears tokens and redirects to landing page
- [ ] Expired access token is refreshed transparently via refresh token
- [ ] All auth API integration tests pass

### Resume Management (SRS FR-04, FR-05, FR-20)
- [ ] User can upload a PDF resume (up to 5MB)
- [ ] User can upload a DOCX resume (up to 5MB)
- [ ] Files > 5MB are rejected with a clear error message
- [ ] Non-PDF/DOCX files are rejected with a clear error message
- [ ] Scanned PDFs (no text) are detected and rejected with guidance
- [ ] Parsed sections (Contact, Summary, Experience, Education, Skills) are stored in MongoDB
- [ ] Resume history page lists all user's uploads
- [ ] Delete removes a resume from the list

### AI Analysis (SRS FR-06, FR-07, FR-08, FR-09)
- [ ] Triggering analysis calls Gemini and returns all required score dimensions
- [ ] ATS score, grammar score, and formatting score are displayed
- [ ] Section-by-section feedback is displayed
- [ ] Strengths and weaknesses are listed
- [ ] Missing keywords are displayed
- [ ] Analysis results are persisted in MongoDB
- [ ] Retry logic fires on Gemini failure (verified in tests)
- [ ] Cached result returned when re-analyzing unchanged resume

### Dashboard & Reports (SRS FR-15, FR-16, FR-18, FR-19)
- [ ] Dashboard stats cards display correct figures
- [ ] RadarChart displays all score dimensions with correct values
- [ ] BarChart displays score breakdown
- [ ] LineChart displays score progression across uploads
- [ ] PDF report downloads successfully with all analysis sections
- [ ] Dark/light mode toggle works and persists across sessions
- [ ] Empty state shown for users with no resumes

### Job Description Matching (SRS FR-10)
- [ ] User can paste a job description and receive a match score
- [ ] Matched and missing keywords are displayed
- [ ] Suggestions for improvement are listed
- [ ] JDs are saved and retrievable

### Cover Letter Generation (SRS FR-11)
- [ ] Cover letter is generated and reflects resume content
- [ ] Cover letter improves with JD provided
- [ ] Generated cover letter can be copied or downloaded

### Interview Preparation (SRS FR-12)
- [ ] Technical questions are generated relevant to the resume's skills
- [ ] Behavioral questions are included
- [ ] Tips are provided for each question

### Resume Rewrite (SRS FR-13)
- [ ] Rewrite suggestions are provided per section
- [ ] Original and suggested text shown side by side

### Resume History & Progress (SRS FR-14, FR-15)
- [ ] All uploaded resumes are listed with dates and ATS scores
- [ ] Score progression over time is visible in a chart

### Profile & Settings (SRS FR-17, FR-18)
- [ ] Profile name, headline, and target role can be updated
- [ ] Avatar can be uploaded and displayed
- [ ] Password change works (wrong current password rejected)
- [ ] Theme preference synced server-side
- [ ] Account deletion disables login

### Cross-Cutting (SRS §6 NFR)
- [ ] Application is responsive on mobile (375px), tablet (768px), and desktop (1280px+)
- [ ] Dark mode and light mode work on all pages
- [ ] Application loads and functions correctly on Chrome, Firefox, Edge, Safari (latest two versions)
- [ ] WCAG 2.1 AA color contrast verified
- [ ] All form fields are keyboard-navigable
- [ ] AI analysis completes within 25 seconds for a typical resume
- [ ] Non-AI API endpoints respond within 500ms
- [ ] Zero critical security vulnerabilities (`npm audit` clean)
- [ ] All backend unit + integration tests pass with ≥ 70% coverage
- [ ] No critical or high severity bugs open

### Deployment
- [ ] Production URL is live and accessible
- [ ] All smoke tests pass on production
- [ ] Sentry error monitoring is active
- [ ] UptimeRobot uptime monitoring is active
- [ ] MongoDB Atlas backups are enabled and verified
- [ ] CHANGELOG.md documents v1.0.0 release
- [ ] `v1.0.0` git tag pushed to `main`