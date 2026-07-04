# Development-Roadmap.md
# Development Roadmap
## AI Resume Analyzer & Career Assistant

**Document Version:** 1.0
**Document Type:** Development Roadmap
**Reference:** SRS v1.0, Architecture v1.0, Database v1.0, API v1.0, UI-Guide v1.0, AI-Prompts v1.0
**Methodology:** Agile / Scrum
**Status:** Ready for Development

---

## Table of Contents

1. Project Overview
2. Development Methodology
3. Development Phases
4. Sprint Planning
5. Milestones
6. Git Workflow
7. Risk Management
8. MVP Scope
9. Final Release Checklist

---

## 1. Project Overview

### 1.1 Vision

To build a production-grade, AI-powered SaaS platform that functions as an end-to-end career companion — enabling job seekers to analyze, optimize, and tailor their resumes with the judgment of an experienced recruiter and ATS system, all in one cohesive interface.

### 1.2 Goals

- Deliver a fully functional MVP covering authentication, resume upload, AI analysis, ATS scoring, and a results dashboard.
- Progressively layer in job description matching, cover letter generation, interview preparation, and career roadmap features.
- Build a codebase that is maintainable, modular, and extensible toward Phase 3 (premium) features without architectural rewrites.
- Achieve target NFRs: analysis completion within 25 seconds, 99.5% uptime, WCAG 2.1 AA compliance.

### 1.3 Success Criteria

| Criterion | Target |
|---|---|
| Resume analysis success rate | ≥ 98% of uploads complete AI analysis |
| End-to-end analysis time | < 25 seconds |
| All FR-01 through FR-20 implemented | 100% |
| Test coverage (unit + integration) | ≥ 70% |
| Zero critical security vulnerabilities at launch | Verified via OWASP checklist |
| Mobile-responsive UI across breakpoints | Verified manually and via testing |
| Dark/light theme fully functional | Verified across all pages |

### 1.4 Deliverables

- Fully functional React SPA (frontend)
- RESTful Node.js/Express API (backend)
- MongoDB Atlas database with all schemas from Database.md
- Google Gemini AI integration with all prompts from AI-Prompts.md
- PDF report generation
- JWT authentication with refresh token flow
- Deployed production environment (Vercel + Railway/Render + MongoDB Atlas)
- Complete documentation set (SRS, Architecture, API, Database, UI-Guide, AI-Prompts, Roadmap, Testing Strategy)

---

## 2. Development Methodology

### 2.1 Agile

Agile is the chosen methodology because the project involves AI-driven features whose exact behavior must be discovered iteratively. Strict waterfall planning cannot anticipate Gemini prompt tuning needs, schema refinements based on real AI responses, or UX adjustments discovered after seeing actual dashboard data. Agile allows course-correction at every sprint boundary without scrapping prior work.

### 2.2 Scrum Framework

The project adopts a Scrum-aligned workflow adapted for solo or small-team development:

| Ceremony | Frequency | Purpose |
|---|---|---|
| Sprint Planning | Start of each sprint | Define sprint goal, select stories, estimate effort |
| Daily Stand-up | Daily (async note for solo dev) | Track progress, surface blockers |
| Sprint Review | End of each sprint | Demo completed work, validate acceptance criteria |
| Retrospective | End of each sprint | Identify what worked, what to improve |
| Backlog Refinement | Mid-sprint | Groom and estimate upcoming stories |

### 2.3 Sprint Duration

Each sprint is **1 week** (7 days). This keeps feedback loops short and forces prioritization. Each sprint produces a working, testable increment of the application.

### 2.4 Why Agile

- AI prompt outputs are unpredictable until tested against real resumes — iterative refinement is essential.
- UI/UX for a data-rich dashboard (charts, scores, sections) benefits from incremental visual feedback.
- The project has a phased feature roadmap (MVP → Advanced → Premium per SRS §26) that maps naturally to Agile increments.
- Risk is better managed when deployment and integration happen frequently rather than as a big-bang event.

---

## 3. Development Phases

---

### Phase 1 — Project Initialization

**Estimated Duration:** 3–4 days
**Priority:** Critical (blocker for all subsequent phases)

#### Objectives
- Establish the project repository, folder structure, tooling, and environments so that all subsequent development has a stable foundation.

#### Tasks

- [ ] Create monorepo or separate `frontend/` and `backend/` repositories (per SRS §27 folder structure)
- [ ] Initialize React app (Vite) with Tailwind CSS and design tokens from UI-Guide.md
- [ ] Initialize Node.js/Express app with ESLint, Prettier, and Nodemon
- [ ] Configure `.env` files for `development`, `staging`, and `production` environments
- [ ] Set up MongoDB Atlas cluster; create `development` database
- [ ] Configure CORS, Helmet, Morgan middleware on Express
- [ ] Set up `nodemon` for hot-reload in development
- [ ] Review and internalize all six source documents (SRS, Architecture, Database, API, UI-Guide, AI-Prompts)
- [ ] Create a shared `constants/` module for environment variable names
- [ ] Set up GitHub repository with branch protection on `main`
- [ ] Configure `.gitignore` to exclude `.env`, `node_modules`, build artifacts
- [ ] Create README.md with project overview and local setup instructions

#### Deliverables
- Running React dev server on localhost:5173
- Running Express server on localhost:5000 returning `{ status: "ok" }` on `GET /api/v1/health`
- MongoDB Atlas connected and verified
- GitHub repository initialized with correct branch structure

#### Dependencies
- None (first phase)

#### Risks
- Environment variable misconfiguration delays later phases
- MongoDB Atlas network access rules blocking local dev

#### Mitigation
- Use a `.env.example` template committed to repo
- Whitelist `0.0.0.0/0` for dev; lock down for production

#### Acceptance Criteria
- [ ] `npm run dev` starts both frontend and backend without errors
- [ ] `GET /api/v1/health` returns `200 OK`
- [ ] MongoDB connection logs "Connected to MongoDB" on startup
- [ ] Folder structure matches SRS §27 exactly

---

### Phase 2 — Authentication

**Estimated Duration:** 5–7 days
**Priority:** Critical

#### Objectives
- Implement complete user authentication covering registration, login, token management, logout, and protected route enforcement, consistent with API.md §2 and Database.md User schema.

#### Tasks

**Backend:**
- [ ] Create `User` Mongoose model (Database.md `users` collection)
- [ ] Implement `POST /api/v1/auth/register` — validation, duplicate check, bcrypt hash, JWT issuance
- [ ] Implement `POST /api/v1/auth/login` — credential verification, access + refresh token issuance
- [ ] Implement `POST /api/v1/auth/refresh-token` — validate refresh token, issue new access token
- [ ] Implement `POST /api/v1/auth/logout` — invalidate refresh token
- [ ] Implement `POST /api/v1/auth/forgot-password` — generate reset token, send email (Nodemailer)
- [ ] Implement `POST /api/v1/auth/reset-password` — validate token, update password
- [ ] Implement `GET /api/v1/auth/me` — return current user profile
- [ ] Write `authMiddleware.js` — JWT validation, attach `req.user`
- [ ] Store refresh tokens in `refreshTokens` collection (Database.md)

**Frontend:**
- [ ] Build Register page (`/register`) with form validation (UI-Guide.md Auth pages)
- [ ] Build Login page (`/login`) with error states
- [ ] Build Forgot Password and Reset Password pages
- [ ] Implement `AuthContext` using React Context API
- [ ] Implement `axios` interceptors for attaching Bearer tokens and refreshing expired tokens
- [ ] Implement protected route wrapper (`<PrivateRoute>`) using React Router
- [ ] Implement redirect to `/dashboard` on successful login, redirect to `/login` on 401

#### Deliverables
- Fully functional registration and login flows
- JWT access token (15 min) + refresh token (7 days) lifecycle
- Protected routes blocking unauthenticated access
- Auth state persisted across page refreshes (via refresh token)

#### Dependencies
- Phase 1 complete

#### Risks
- Token refresh race conditions if multiple concurrent requests trigger a 401
- Email delivery failures for password reset in dev (SMTP config)

#### Mitigation
- Implement a token refresh queue/mutex on the frontend
- Use Mailtrap or Ethereal for dev email testing

#### Acceptance Criteria
- [ ] User can register, login, and reach the dashboard
- [ ] Accessing `/dashboard` without a token redirects to `/login`
- [ ] Expired access token is transparently refreshed without user action
- [ ] Logout clears tokens and redirects to landing page
- [ ] Passwords are bcrypt-hashed in the database (never stored as plaintext)

---

### Phase 3 — Resume Management

**Estimated Duration:** 5–7 days
**Priority:** Critical

#### Objectives
- Enable authenticated users to upload, store, parse, and manage resume files (PDF/DOCX), consistent with API.md §3 and Database.md `resumes` collection.

#### Tasks

**Backend:**
- [ ] Configure `multer` middleware for file upload (PDF/DOCX, max 5MB per SRS FR-20)
- [ ] Implement file type validation (MIME type + extension check)
- [ ] Implement `pdf-parse` integration for PDF text extraction
- [ ] Implement `mammoth` integration for DOCX text extraction
- [ ] Implement section segmentation (Contact, Summary, Experience, Education, Skills, Projects, Certifications)
- [ ] Create `Resume` Mongoose model (Database.md `resumes` collection)
- [ ] Implement `POST /api/v1/resumes/upload` — upload, parse, store metadata + extracted text
- [ ] Implement `GET /api/v1/resumes` — list user's resumes (paginated)
- [ ] Implement `GET /api/v1/resumes/:resumeId` — get single resume detail
- [ ] Implement `DELETE /api/v1/resumes/:resumeId` — soft delete
- [ ] Implement `GET /api/v1/resumes/:resumeId/content` — return parsed text sections
- [ ] Store file in cloud object storage or base64 in DB for MVP (per SRS §22)
- [ ] Hash resume content (SHA-256) for duplicate/cache detection (Architecture.md §1.4)

**Frontend:**
- [ ] Build Resume Upload page with drag-and-drop zone (UI-Guide.md Upload section)
- [ ] Implement file type/size validation on the client before upload
- [ ] Show upload progress indicator
- [ ] Show parsing in-progress state (spinner/skeleton)
- [ ] Build Resume History page (list view with name, date, ATS score badge)
- [ ] Implement delete resume with confirmation modal

#### Deliverables
- Working resume upload accepting PDF and DOCX
- Parsed text sections stored in MongoDB
- Resume list page showing all uploaded resumes
- File validation rejecting unsupported formats gracefully

#### Dependencies
- Phase 2 complete (auth middleware required for all resume endpoints)

#### Risks
- Scanned/image PDFs yield empty extracted text (SRS §25)
- Large DOCX files with embedded images slow mammoth parsing

#### Mitigation
- Detect empty extraction and return `400` with user-friendly message prompting text-based PDF upload
- Set a parsing timeout; reject files exceeding it

#### Acceptance Criteria
- [ ] PDF upload parses and stores text sections correctly
- [ ] DOCX upload parses and stores text sections correctly
- [ ] Files > 5MB are rejected with `413` response
- [ ] Non-PDF/DOCX files are rejected with `415` response
- [ ] Empty-text extraction returns a clear error message, not a silent failure
- [ ] Resume list shows all uploads for the authenticated user only

---

### Phase 4 — AI Integration

**Estimated Duration:** 7–10 days
**Priority:** Critical

#### Objectives
- Integrate Google Gemini API to perform structured resume analysis per AI-Prompts.md, returning a validated JSON response stored in the `analyses` collection.

#### Tasks

**Backend:**
- [ ] Set up `@google/generative-ai` SDK; configure API key from environment variables
- [ ] Build AI abstraction layer (`services/ai/aiProvider.js`) with a provider-agnostic interface (Architecture.md §1.4)
- [ ] Implement `services/ai/resumeAnalysisService.js` — construct resume analysis prompt (AI-Prompts.md Prompt 1)
- [ ] Implement JSON schema validation for AI response using `zod` or `ajv`
- [ ] Implement retry logic (up to 3 retries with exponential backoff) for malformed JSON or API failures
- [ ] Create `Analysis` Mongoose model (Database.md `analyses` collection)
- [ ] Implement `POST /api/v1/resumes/:resumeId/analysis` — trigger analysis, persist result
- [ ] Implement `GET /api/v1/resumes/:resumeId/analysis` — retrieve latest analysis
- [ ] Implement `GET /api/v1/resumes/:resumeId/analysis/history` — retrieve all analysis versions
- [ ] Implement content-hash caching: return cached analysis if resume content unchanged (Architecture.md §1.4)
- [ ] Implement ATS scoring endpoint result extraction from analysis JSON
- [ ] Set Gemini `responseMimeType: "application/json"` and `temperature: 0.3` per AI-Prompts.md

**Frontend:**
- [ ] Build Analysis Results page (UI-Guide.md Dashboard/Analysis section)
- [ ] Build ATS Score card (circular gauge or large number display)
- [ ] Build Overall Score radar chart (Recharts RadarChart — FR-19)
- [ ] Build section-by-section score breakdown cards
- [ ] Build strengths and weaknesses lists
- [ ] Build missing keywords display
- [ ] Implement loading skeleton during AI processing (15–25 sec expected)
- [ ] Implement error state when analysis fails

#### Deliverables
- End-to-end resume analysis flow: upload → parse → AI call → JSON validation → persist → display
- ATS score, grammar score, formatting score rendered in dashboard
- Schema-validated AI JSON stored in `analyses` collection

#### Dependencies
- Phase 3 complete (resume parsing must precede analysis)
- Google Gemini API key provisioned

#### Risks
- Gemini returns malformed/incomplete JSON (SRS §25)
- API quota exhaustion during development testing
- High latency (>25 sec) for long resumes

#### Mitigation
- `zod` schema validation with retry; graceful failure UI for exhausted retries
- Use a test Gemini key with generous quota; cache analyses during dev
- Set `max_tokens` and character limits on resume text sent to Gemini

#### Acceptance Criteria
- [ ] Resume analysis returns and displays all required score dimensions
- [ ] Malformed Gemini JSON triggers retry without crashing the server
- [ ] Analysis results are persisted in MongoDB `analyses` collection
- [ ] Cached analysis returned when same resume content is re-analyzed
- [ ] Loading state displays during the 15–25 second AI processing window
- [ ] All score values render in the correct chart components

---

### Phase 5 — Dashboard

**Estimated Duration:** 5–7 days
**Priority:** High

#### Objectives
- Build the main Dashboard page with user statistics, score charts, resume history summary, and progress tracking as defined in UI-Guide.md and SRS FR-09, FR-15, FR-19.

#### Tasks

**Backend:**
- [ ] Implement `GET /api/v1/analytics/summary` — total resumes, avg ATS score, best score, improvement delta
- [ ] Implement `GET /api/v1/analytics/progress` — score progression data points over time
- [ ] Implement `GET /api/v1/reports` — list generated reports
- [ ] Implement PDF report generation service (`services/report/pdfReportService.js`) using `pdfkit` or `puppeteer`
- [ ] Implement `POST /api/v1/reports/generate` — generate and store PDF report
- [ ] Implement `GET /api/v1/reports/:reportId/download` — stream PDF to client

**Frontend:**
- [ ] Build Dashboard page layout (UI-Guide.md Dashboard)
- [ ] Build stats summary cards (total resumes, best ATS score, average score)
- [ ] Build score progression line chart (Recharts LineChart)
- [ ] Build score breakdown bar chart (Recharts BarChart)
- [ ] Build recent resumes list widget
- [ ] Build empty state (first-time user with CTA to upload)
- [ ] Implement "Generate Report" button triggering PDF download
- [ ] Implement dark/light theme toggle (UI-Guide.md theme system), persisted to localStorage and user preferences

#### Deliverables
- Fully rendered Dashboard with real data from backend
- Score progression chart updating as user uploads more resumes
- Downloadable PDF report of full analysis

#### Dependencies
- Phase 4 complete (analysis data required for charts)

#### Risks
- PDF generation library (puppeteer) heavy in memory on Railway/Render free tier

#### Mitigation
- Use `pdfkit` as a lighter alternative for MVP; defer puppeteer to Phase 2+ if needed

#### Acceptance Criteria
- [ ] Dashboard loads with real stats for the authenticated user
- [ ] Empty state shown for users with no uploaded resumes
- [ ] Score progression chart updates after a new analysis
- [ ] PDF report downloads successfully with all analysis sections
- [ ] Dark and light mode toggle works on all dashboard elements

---

### Phase 6 — Job Description Matching

**Estimated Duration:** 5–7 days
**Priority:** High

#### Objectives
- Allow users to paste a job description and receive an AI-generated match score, keyword gap analysis, and tailored suggestions per SRS FR-10 and API.md §5.

#### Tasks

**Backend:**
- [ ] Create `JobDescription` Mongoose model (Database.md `jobDescriptions` collection)
- [ ] Implement `POST /api/v1/job-descriptions` — save JD text linked to user
- [ ] Implement `GET /api/v1/job-descriptions` — list user's saved JDs
- [ ] Implement `POST /api/v1/job-descriptions/:jdId/match` — trigger Gemini JD match analysis (AI-Prompts.md Prompt 2)
- [ ] Implement `GET /api/v1/job-descriptions/:jdId/match` — retrieve match result
- [ ] Store match result in `analyses` collection with `analysisType: "jd_match"`
- [ ] Validate JD text: minimum 50 characters, maximum 10,000 characters

**Frontend:**
- [ ] Build Job Match page with JD text input area (UI-Guide.md Job Match section)
- [ ] Implement resume selector (choose which resume to match against)
- [ ] Build match results view: match score, matched keywords, missing keywords, suggestions
- [ ] Build "Keywords to Add" chip list
- [ ] Implement loading state during AI processing

#### Deliverables
- Job description matching flow end-to-end
- Match score and gap analysis displayed clearly
- Results persisted and retrievable

#### Dependencies
- Phase 4 complete (analysis infrastructure reused)

#### Risks
- Users paste poorly formatted JD text causing poor match quality

#### Mitigation
- Character minimum validation; UI guidance text ("Paste the full job description including responsibilities and requirements")

#### Acceptance Criteria
- [ ] User can save a JD and match it against any of their resumes
- [ ] Match score (0–100) is displayed
- [ ] Missing keywords are listed clearly
- [ ] Suggestions for improvement are actionable and specific

---

### Phase 7 — Resume Enhancement

**Estimated Duration:** 7–10 days
**Priority:** High

#### Objectives
- Implement cover letter generation (SRS FR-11), interview question generation (SRS FR-12), resume rewrite suggestions (SRS FR-13), and career roadmap recommendations per API.md §4–§7 and AI-Prompts.md.

#### Tasks

**Backend:**
- [ ] Implement `POST /api/v1/resumes/:resumeId/rewrite` — AI section-by-section rewrite suggestions (AI-Prompts.md Prompt 5)
- [ ] Create `CoverLetter` Mongoose model (Database.md `coverLetters` collection)
- [ ] Implement `POST /api/v1/cover-letters/generate` — generate tailored cover letter (AI-Prompts.md Prompt 3)
- [ ] Implement `GET /api/v1/cover-letters` — list user's cover letters
- [ ] Implement `GET /api/v1/cover-letters/:id` — retrieve single cover letter
- [ ] Implement `DELETE /api/v1/cover-letters/:id`
- [ ] Create `InterviewPrep` Mongoose model (Database.md `interviewPrep` collection)
- [ ] Implement `POST /api/v1/interview/generate` — generate interview questions (AI-Prompts.md Prompt 4)
- [ ] Implement `GET /api/v1/interview` — list interview prep sets
- [ ] Implement career roadmap endpoint using AI-Prompts.md Prompt 6

**Frontend:**
- [ ] Build Cover Letter page: generate, view, copy, download (UI-Guide.md)
- [ ] Build Interview Prep page: display technical + behavioral questions with tips
- [ ] Build Resume Rewrite page: show original vs AI-suggested text side-by-side
- [ ] Build Career Roadmap section: skills to learn, certifications, projects
- [ ] Implement copy-to-clipboard for cover letters and rewritten sections

#### Deliverables
- Working cover letter generator tied to resume + optional JD
- Interview question set (technical + behavioral) for user's target role
- Resume section rewrite suggestions displayed alongside originals
- Career roadmap with certifications and project recommendations

#### Dependencies
- Phase 4 (AI infrastructure), Phase 6 (JD data for tailored cover letters)

#### Risks
- Cover letter quality degrades significantly without a JD — users may be disappointed
- Interview question generation may produce generic output without enough resume context

#### Mitigation
- Make JD optional but show a UI nudge: "For best results, add a job description"
- Ensure resume parsed sections are fully included in the prompt context

#### Acceptance Criteria
- [ ] Cover letter generated reflects the user's resume content and JD (if provided)
- [ ] Interview questions include both technical (role-relevant) and behavioral questions
- [ ] Rewrite suggestions are per-section (Summary, Experience, Skills, etc.)
- [ ] Career roadmap includes ≥ 3 skill recommendations, ≥ 2 certifications, ≥ 2 project ideas

---

### Phase 8 — User Profile & Settings

**Estimated Duration:** 3–5 days
**Priority:** Medium

#### Objectives
- Implement profile management, account settings, notification preferences, and theme preferences per API.md §10–§11 and SRS FR-17, FR-18.

#### Tasks

**Backend:**
- [ ] Implement `GET /api/v1/profile` — return user profile
- [ ] Implement `PATCH /api/v1/profile` — update name, headline, target role, location
- [ ] Implement `POST /api/v1/profile/avatar` — upload and store profile avatar
- [ ] Implement `PATCH /api/v1/settings/preferences` — update theme, language, notification prefs
- [ ] Implement `PATCH /api/v1/settings/password` — change password (requires current password)
- [ ] Implement `DELETE /api/v1/settings/account` — soft delete account

**Frontend:**
- [ ] Build Profile page with editable fields and avatar upload
- [ ] Build Settings page: Account, Preferences, Notifications tabs
- [ ] Implement theme toggle synced to user preference via API (not just localStorage)
- [ ] Implement password change form with current/new/confirm fields
- [ ] Implement account deletion flow with confirmation

#### Deliverables
- Profile page with all editable fields
- Settings saved server-side and rehydrated on login
- Theme preference persisted across devices

#### Dependencies
- Phase 2 complete (auth), Phase 5 (theme toggle scaffolded)

#### Risks
- Avatar upload storage costs (use small size limit: 2MB, JPEG/PNG only)

#### Acceptance Criteria
- [ ] Profile updates persist across sessions
- [ ] Theme preference applies immediately and persists on re-login
- [ ] Password change rejects incorrect current password
- [ ] Account deletion removes user data (or marks as deleted)

---

### Phase 9 — Testing

**Estimated Duration:** 5–7 days
**Priority:** High

#### Objectives
- Write and execute comprehensive unit, integration, and manual tests before deployment. See Testing-Strategy.md for full test plan.

#### Tasks

**Backend Testing:**
- [ ] Set up `Jest` and `Supertest` for API integration tests
- [ ] Write unit tests for all service functions (auth, resume parsing, AI orchestration, report generation)
- [ ] Write integration tests for all API endpoints (auth, resume, analysis, JD match, cover letter, interview, reports, profile, settings)
- [ ] Write tests for error handling paths (invalid input, expired token, Gemini failure)
- [ ] Mock Gemini API calls in tests using Jest mocks

**Frontend Testing:**
- [ ] Set up `Vitest` and `React Testing Library`
- [ ] Write unit tests for utility functions and custom hooks
- [ ] Write component tests for forms (Register, Login, Upload, JD input)
- [ ] Write route protection tests (unauthenticated redirect)

**Manual Testing:**
- [ ] Execute full user journey from registration to PDF report download
- [ ] Test on Chrome, Firefox, Edge, Safari (latest two versions per SRS §6)
- [ ] Test on mobile viewports (375px, 768px)
- [ ] Test dark mode and light mode on all pages

#### Deliverables
- Test suite with ≥ 70% backend code coverage
- Manual test execution report
- Bug list with severity classification

#### Dependencies
- Phases 2–8 complete

#### Risks
- AI mocking may not accurately reflect real Gemini response variability

#### Mitigation
- Maintain a library of real Gemini response fixtures for tests; supplement with mocks

#### Acceptance Criteria
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] No critical or high severity bugs open at release gate
- [ ] Manual cross-browser testing complete

---

### Phase 10 — Deployment

**Estimated Duration:** 3–5 days
**Priority:** Critical

#### Objectives
- Deploy frontend to Vercel, backend to Railway or Render, and configure production MongoDB Atlas, environment variables, and monitoring per SRS §22 and Architecture.md §13.

#### Tasks

- [ ] Configure Vercel project for frontend; set `VITE_API_BASE_URL` environment variable
- [ ] Configure Railway/Render project for backend; set all production environment variables
- [ ] Create production MongoDB Atlas cluster with IP allowlist and automated backups enabled
- [ ] Configure CORS on backend to allow only the Vercel production domain
- [ ] Set up Sentry (or equivalent) for error tracking on both frontend and backend
- [ ] Run database index creation scripts (Database.md indexes)
- [ ] Perform smoke test on production: register → upload → analyze → download report
- [ ] Configure custom domain (if applicable)
- [ ] Verify all environment variables are correct in production (no dev keys)
- [ ] Set up uptime monitoring (UptimeRobot or Railway health checks)
- [ ] Create `CHANGELOG.md` for v1.0.0 release

#### Deliverables
- Live production application accessible via public URL
- Production MongoDB Atlas with indexes and backups configured
- Error monitoring active
- Uptime monitoring active

#### Dependencies
- Phase 9 complete (all tests passing)

#### Risks
- Environment variable mismatches between dev and production causing silent failures
- Cold-start latency on Railway/Render free tier

#### Mitigation
- Use a pre-deployment checklist comparing `.env.example` against production vars
- Use paid tier or configure keep-alive pings to prevent cold starts

#### Acceptance Criteria
- [ ] Production URL loads the application without errors
- [ ] Registration, login, upload, analysis, and report download all work in production
- [ ] No `.env` secrets exposed in frontend bundle (verify via browser DevTools)
- [ ] Sentry receives a test error event
- [ ] MongoDB Atlas shows active connections from production backend

---

## 4. Sprint Planning

### Example Sprint: Sprint 4 — AI Integration (Phase 4, Week 1)

| Field | Detail |
|---|---|
| **Sprint Number** | Sprint 4 |
| **Duration** | 7 days |
| **Sprint Goal** | Integrate Gemini AI analysis so that a user can upload a resume and receive a structured, schema-validated analysis result displayed on the dashboard |

#### Sprint Stories

| Story ID | User Story | Estimated Hours | Priority |
|---|---|---|---|
| S4-01 | As a developer, I want to set up the AI abstraction layer so that Gemini can be called without leaking provider details into controllers | 3h | Must |
| S4-02 | As a developer, I want to implement the resume analysis prompt (AI-Prompts.md Prompt 1) and receive a valid JSON response | 4h | Must |
| S4-03 | As a developer, I want to validate the AI JSON response against a zod schema and retry up to 3 times on failure | 3h | Must |
| S4-04 | As a developer, I want to create the Analysis Mongoose model and persist validated results | 2h | Must |
| S4-05 | As a developer, I want to implement POST /api/v1/resumes/:resumeId/analysis endpoint | 2h | Must |
| S4-06 | As a user, I want to see the ATS score displayed as a large score card after analysis | 3h | Must |
| S4-07 | As a user, I want to see an overall score radar chart showing all dimensions | 4h | Must |
| S4-08 | As a user, I want to see section-by-section feedback cards for each resume section | 4h | Must |
| S4-09 | As a developer, I want content-hash caching so that re-analyzing the same resume returns the cached result | 2h | Should |
| S4-10 | Write integration tests for analysis endpoint including Gemini mock | 3h | Must |
| **Total** | | **30h** | |

#### Definition of Done

- [ ] Code is written, reviewed (or self-reviewed), and merged to the sprint branch
- [ ] Unit/integration tests written and passing for new endpoints
- [ ] Feature is testable end-to-end in the dev environment
- [ ] No ESLint errors
- [ ] API response matches the contract defined in API.md
- [ ] UI matches the design specified in UI-Guide.md

---

## 5. Milestones

| Milestone | Description | Target Completion |
|---|---|---|
| **M1 — Foundation Ready** | Phase 1 complete; dev environment running, repo configured | End of Week 1 |
| **M2 — Auth Live** | Phase 2 complete; users can register, login, and access protected routes | End of Week 2 |
| **M3 — Resume Pipeline Operational** | Phase 3 complete; PDF/DOCX upload and parsing working end-to-end | End of Week 3 |
| **M4 — AI Analysis Working** | Phase 4 complete; full Gemini analysis displayed on dashboard | End of Week 5 |
| **M5 — Dashboard Complete** | Phase 5 complete; charts, progress, PDF report all working | End of Week 6 |
| **M6 — Core MVP Complete** | Phases 1–5 fully tested and stable; MVP scope delivered | End of Week 7 |
| **M7 — Advanced Features Complete** | Phases 6–7 complete; JD matching, cover letter, interview prep all working | End of Week 9 |
| **M8 — Settings & Profile Complete** | Phase 8 complete; profile, preferences, and theme all working | End of Week 10 |
| **M9 — Testing Complete** | Phase 9 complete; all tests passing, manual cross-browser verified | End of Week 11 |
| **M10 — Production Launch** | Phase 10 complete; live production URL, monitoring active | End of Week 12 |

---

## 6. Git Workflow

### 6.1 Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code only; protected; releases tagged here |
| `develop` | Integration branch; all feature branches merge here |
| `feature/<phase>-<short-description>` | Individual feature branches (e.g., `feature/phase2-auth-register`) |
| `fix/<short-description>` | Bug fix branches (e.g., `fix/jwt-refresh-race-condition`) |
| `chore/<short-description>` | Non-feature work (e.g., `chore/update-dependencies`) |
| `release/v<version>` | Release preparation branch before merging to `main` |

### 6.2 Commit Message Convention

Follow the **Conventional Commits** specification:
<type>(<scope>): <short summary>
[optional body]

[optional footer]

| Type | When to Use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |
| `chore` | Build, config, dependency updates |
| `refactor` | Code change that is neither a fix nor a feature |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace (no logic change) |

**Examples:**
feat(auth): implement JWT refresh token endpoint

fix(resume): handle empty extraction from scanned PDF

test(analysis): add integration test for Gemini retry logic

chore: update @google/generative-ai to 0.21.0
### 6.3 Pull Request Strategy

- All code merges to `develop` via Pull Request (even for solo dev — PRs are the review checkpoint).
- PR description must include: what was built, how to test it, and a checklist against the Definition of Done.
- Self-review required before merge; external review optional.
- Squash-merge preferred to keep `develop` history clean.
- `main` ← `develop` merges happen at milestone boundaries only.

### 6.4 Release Tags

- Use semantic versioning: `v<MAJOR>.<MINOR>.<PATCH>`
- Tag on `main` at each milestone:
  - `v0.1.0` — M6 (MVP complete)
  - `v0.2.0` — M7 (Advanced features)
  - `v1.0.0` — M10 (Production launch)

---

## 7. Risk Management

### 7.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| `pdf-parse` fails on non-standard PDFs | Medium | High | Detect empty extraction; prompt user to re-upload a text-based PDF |
| `mammoth` produces garbled text from complex DOCX | Low | Medium | Fallback to plain-text extraction; flag sections as unrecognized |
| MongoDB Atlas connection drops in production | Low | High | Implement Mongoose reconnect strategy; configure Atlas auto-scaling |
| Node.js memory leak from large resume processing | Low | Medium | Set `--max-old-space-size` limit; implement request timeout middleware |

### 7.2 AI Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Gemini returns malformed JSON | Medium | High | Schema validation + retry up to 3 times with exponential backoff |
| Gemini returns hallucinated feedback | Medium | Medium | Frame output as "AI suggestions"; add disclaimer in UI |
| Gemini API rate limit hit during peak testing | Medium | Medium | Implement request queue; use caching; apply exponential backoff |
| Gemini API goes down | Low | High | Return `503 Service Unavailable` with retry guidance; cached results unaffected |
| Token limit exceeded for long resumes | Low | Medium | Truncate resume text to max characters before sending; log truncation events |

### 7.3 Deployment Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Wrong environment variables in production | Medium | High | Pre-deployment checklist; compare against `.env.example` |
| Cold start latency on free-tier Railway/Render | High | Medium | Configure keep-alive pings; upgrade tier if unacceptable |
| Vercel build fails due to missing env vars | Medium | Medium | Define all VITE_ vars in Vercel project settings before deploy |

### 7.4 Performance Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| AI analysis exceeds 25 seconds | Medium | Medium | Optimize prompt size; use streaming response if supported |
| PDF report generation blocks API thread | Low | Medium | Run PDF generation asynchronously; use a background job in Phase 2+ |
| Large number of concurrent AI requests | Low | High | Implement a per-user request queue; rate limit AI endpoints |

### 7.5 Security Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| JWT secret leaked via env var misconfiguration | Low | Critical | Use strong random secrets; never commit `.env`; rotate keys on suspicion |
| Resume files accessible to wrong users | Low | Critical | Enforce `req.user._id === resume.userId` check on all resume endpoints |
| XSS via AI-generated content rendered in DOM | Medium | High | Sanitize all AI text output before rendering; use `DOMPurify` |
| Brute force on login endpoint | Medium | Medium | Implement rate limiting on `/api/v1/auth/login` (5 attempts / 15 min) |

---

## 8. MVP Scope

### Must Have (MVP — Phases 1–5)
- User registration and login (email/password + JWT)
- Forgot password / reset password flow
- Resume upload (PDF/DOCX, max 5MB)
- Resume parsing (text extraction + section segmentation)
- AI-powered analysis via Gemini returning structured JSON
- ATS score, grammar score, formatting score
- Section-by-section feedback (Summary, Experience, Education, Skills)
- Dashboard with stats cards and score charts (RadarChart, BarChart)
- Resume history list
- Score progression chart (LineChart)
- PDF report download
- Dark/light mode toggle
- Responsive design (mobile + desktop)

### Should Have (Advanced — Phases 6–7)
- Job description matching with match score and keyword gap analysis
- Cover letter generation
- Interview question generation (technical + behavioral)
- Resume section rewrite suggestions
- Career roadmap (skills, certifications, projects)

### Nice to Have (Polish — Phase 8)
- User profile with avatar
- Account settings with notification preferences
- Theme preference synced server-side across devices

### Future Features (Phase 3 / Post-Launch)
- AI mock interview (voice/video)
- LinkedIn / GitHub / portfolio analysis
- Resume version comparison (side-by-side diff)
- Resume heatmap
- AI chat assistant
- Resume template builder (drag-and-drop)
- Multi-language resume support
- Subscription / billing tiers (Stripe integration)
- 30-day structured learning roadmap
- Team / recruiter-facing dashboard

---

## 9. Final Release Checklist

### Documentation
- [ ] SRS.md reviewed and matches implemented features
- [ ] API.md accurate for all live endpoints
- [ ] Database.md matches all Mongoose models in production
- [ ] Architecture.md reflects actual deployed architecture
- [ ] README.md includes local setup, environment variables, and deployment instructions
- [ ] CHANGELOG.md created for v1.0.0

### Testing
- [ ] All unit tests passing (`npm test`)
- [ ] All integration tests passing
- [ ] No critical or high severity bugs open
- [ ] Manual cross-browser testing complete (Chrome, Firefox, Edge, Safari)
- [ ] Manual mobile testing complete (375px, 768px viewports)
- [ ] Dark mode tested on all pages
- [ ] Full user journey tested end-to-end in production environment

### Deployment
- [ ] Frontend deployed to Vercel with correct `VITE_API_BASE_URL`
- [ ] Backend deployed to Railway/Render with all production environment variables set
- [ ] MongoDB Atlas production cluster configured with IP allowlist and automated backups
- [ ] CORS configured to allow production frontend domain only
- [ ] All database indexes created (Database.md)
- [ ] No `.env` files or secrets committed to git history

### Performance
- [ ] Resume analysis completes within 25 seconds on a typical resume
- [ ] API response times < 500ms for non-AI endpoints
- [ ] No memory leaks detected under sustained load (manual soak test)

### Security
- [ ] JWT secrets are strong random values (≥ 32 chars), not default values
- [ ] Passwords stored as bcrypt hashes (never plaintext)
- [ ] All resume endpoints enforce user ownership check
- [ ] Rate limiting active on auth and AI endpoints
- [ ] Helmet.js security headers active on all responses
- [ ] Input validation active on all POST/PATCH endpoints
- [ ] AI-generated content sanitized before DOM rendering

### Monitoring
- [ ] Sentry (or equivalent) receiving errors from both frontend and backend
- [ ] Uptime monitoring configured with alert notification
- [ ] MongoDB Atlas monitoring dashboard reviewed
- [ ] Health check endpoint `GET /api/v1/health` returns `200` in production