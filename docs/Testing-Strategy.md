# Testing-Strategy.md
# Testing Strategy
## AI Resume Analyzer & Career Assistant

**Document Version:** 1.0
**Document Type:** Testing Strategy & Quality Assurance Plan
**Reference:** SRS v1.0, Architecture v1.0, Database v1.0, API v1.0, UI-Guide v1.0, AI-Prompts v1.0, Development-Roadmap v1.0
**Status:** Ready for Execution

---

## Table of Contents

1. Testing Overview
2. Testing Levels
3. Frontend Testing
4. Backend Testing
5. Database Testing
6. AI Testing
7. Security Testing
8. Performance Testing
9. Edge Cases
10. Test Cases
11. Bug Severity Matrix
12. Release Validation Checklist
13. Quality Metrics
14. Future Testing Strategy

---

## 1. Testing Overview

### 1.1 Purpose

This document defines the complete testing strategy for the AI Resume Analyzer & Career Assistant SaaS application. It establishes the testing approach, coverage requirements, tooling, test case catalog, and quality gates that must be satisfied before a production release.

### 1.2 Objectives

- Verify that all functional requirements FR-01 through FR-20 (SRS §5) are correctly implemented.
- Validate that all non-functional requirements (performance, security, accessibility, availability) are met.
- Ensure the AI integration layer handles schema validation, retries, and failure gracefully.
- Confirm that user data is isolated (no cross-user data leakage).
- Provide sufficient regression coverage to detect regressions introduced in future sprints.

### 1.3 Quality Goals

| Goal | Target |
|---|---|
| Unit test coverage (backend) | ≥ 70% line coverage |
| Integration test coverage (API endpoints) | 100% of documented API.md endpoints |
| Critical path manual test execution | 100% before every release |
| Zero critical bugs at production release | Mandatory gate |
| Zero high severity bugs at production release | Mandatory gate |
| Performance: analysis completion time | < 25 seconds |
| Performance: non-AI API response time | < 500ms p95 |

### 1.4 Testing Scope

**In Scope:**
- Backend API endpoints (all routes in API.md)
- Frontend pages, forms, routing, and components (all pages in UI-Guide.md)
- Database schema validation, CRUD operations, and indexes
- AI prompt construction, response validation, retry logic, and error handling
- Authentication and authorization flows
- File upload validation and parsing
- PDF report generation
- Security controls (JWT, CORS, input validation, rate limiting)
- Cross-browser and responsive design

**Out of Scope (for V1):**
- Load testing beyond 50 concurrent users
- Automated end-to-end (Playwright/Cypress) tests — planned for Phase 2 CI/CD
- Third-party service internal behavior (Gemini, MongoDB Atlas SLA)
- Accessibility audit beyond WCAG 2.1 AA contrast and keyboard navigation

---

## 2. Testing Levels

### 2.1 Unit Testing

Tests individual functions and modules in isolation. Dependencies (database, Gemini API, file system) are mocked.

- **Backend:** Jest — test service functions, utility functions, validation logic, AI schema validators
- **Frontend:** Vitest + React Testing Library — test utility functions, custom hooks, and form validation logic
- **What is NOT unit tested:** Express route handlers in isolation (these are integration-tested end-to-end via Supertest)

### 2.2 Integration Testing

Tests multiple real components working together. Database calls are made to a real test MongoDB database; Gemini is mocked.

- **Tool:** Jest + Supertest (backend)
- **Scope:** Every API endpoint in API.md — request → middleware → controller → service → database → response
- **Database:** Dedicated `test` MongoDB database, seeded before each test suite and cleaned up after

### 2.3 System Testing

End-to-end testing of the full application stack (frontend + backend + database) simulating real user behavior.

- **Tool:** Manual test execution (automated E2E planned for CI/CD Phase 2)
- **Scope:** Full user journeys from landing page through analysis to report download
- **Environment:** Staging environment mirroring production configuration

### 2.4 Acceptance Testing

Validation that all acceptance criteria defined in the Development Roadmap (per phase) are satisfied before marking a phase complete.

- **Who:** Developer (solo) or team lead reviewing against the acceptance criteria checklist
- **Frequency:** At the end of each sprint/phase

### 2.5 Regression Testing

Re-execution of previously passing tests after new code changes to detect regressions.

- **Trigger:** Any merge to `develop`
- **Scope:** Full unit + integration test suite (`npm test`)
- **Frontend regression:** Visual inspection of all pages after each phase

### 2.6 Smoke Testing

Minimal, fast checks that the most critical paths are working after a deployment.

| Smoke Test | Steps |
|---|---|
| API health | `GET /api/v1/health` returns `200 OK` |
| Auth | Register a new user; login; receive JWT |
| Upload | Upload a sample PDF; verify parsed text stored |
| Analysis | Trigger analysis; verify result returned |
| Dashboard | Load dashboard; verify charts render |
| Report | Generate PDF report; verify download works |

Run smoke tests immediately after every deployment to staging and production.

### 2.7 Exploratory Testing

Unscripted testing where the tester explores the application to find unexpected bugs, UX issues, and edge cases not covered by formal test cases.

- **When:** After each phase completes
- **Focus areas:** AI output display (unusual characters, long text), file uploads with unusual file names, rapid sequential actions, browser back/forward navigation

---

## 3. Frontend Testing

### 3.1 Pages

Each page defined in UI-Guide.md must be tested for:
- Correct rendering in authenticated and (where applicable) unauthenticated state
- Correct empty state rendering (no data yet)
- Correct error state rendering (API failure)
- Correct loading state rendering (data fetching in progress)

| Page | Key Assertions |
|---|---|
| Landing Page | CTA buttons route to `/register` and `/login`; no auth required |
| Register | Form validation (required fields, email format, password min length); duplicate email shows error |
| Login | Credential validation; incorrect password shows error; successful login redirects to `/dashboard` |
| Forgot Password | Valid email shows success message; invalid email shows error |
| Reset Password | Valid token allows password reset; expired token shows error |
| Dashboard | Stats cards render; charts render; empty state shown for new user |
| Upload Resume | Drag-and-drop zone accepts PDF/DOCX; file size error shown for >5MB; wrong format rejected |
| Analysis Results | All score sections render; radar chart renders; keyword list renders |
| Job Match | JD textarea accepts text; match score displays after submission |
| Cover Letter | Generated cover letter displays; copy-to-clipboard works |
| Interview Prep | Questions list renders with categories |
| Resume History | List of resumes with dates and ATS scores; delete works with confirmation |
| Profile | Editable fields; avatar upload |
| Settings | Theme toggle; password change; account deletion |

### 3.2 Forms

| Form | Test Scenarios |
|---|---|
| Registration Form | Required fields empty → validation errors; invalid email format → error; password < 8 chars → error; valid input → success |
| Login Form | Empty fields → errors; wrong password → API error displayed; correct credentials → redirect |
| Upload Form | No file selected → disabled submit; wrong file type → error message; file too large → error message; valid file → upload initiates |
| Job Description Form | Empty textarea → error; < 50 chars → error; valid input → match triggered |
| Password Change Form | Current password wrong → API error; new passwords don't match → validation error; valid input → success |

### 3.3 Routing

- `/dashboard` redirects to `/login` when unauthenticated
- `/login` redirects to `/dashboard` when already authenticated
- Invalid routes (`/xyz`) render a 404 page, not a blank screen
- Browser back button after login does not return to login page
- Direct URL navigation to a protected route after session expires redirects to login

### 3.4 Authentication State

- Auth token stored correctly (HTTP-only cookie or memory; never localStorage for access token)
- Token refresh happens transparently on 401 without user-visible disruption
- Logout clears all tokens and redirects to landing page
- Page refresh re-hydrates auth state correctly

### 3.5 Charts

- RadarChart renders with correct score dimensions and values
- BarChart renders with correct axis labels
- LineChart renders progression data with at least 2 data points
- Charts render correctly in both dark and light mode
- Charts do not crash on single data point (only one resume uploaded)

### 3.6 Responsive Design

Test at the following breakpoints per UI-Guide.md:

| Breakpoint | Width | Test |
|---|---|---|
| Mobile | 375px | Navigation collapses to hamburger; cards stack vertically |
| Tablet | 768px | Sidebar collapses or shifts; grid adjusts |
| Desktop | 1280px+ | Full sidebar; multi-column layout |

### 3.7 Accessibility

- All form inputs have associated `<label>` elements or `aria-label`
- Color contrast meets WCAG 2.1 AA (4.5:1 for body text, 3:1 for large text)
- Keyboard navigation: Tab through all interactive elements; Enter/Space activate buttons
- Error messages are announced via `aria-live` region
- Score charts have `aria-label` describing the data

### 3.8 Theme Switching

- Light mode: all text readable; no invisible text on light backgrounds
- Dark mode: all text readable; no invisible text on dark backgrounds
- Toggle switches theme immediately without page reload
- Theme preference persisted: refresh does not reset to default
- Charts, modals, tooltips, and dropdowns all respect active theme

---

## 4. Backend Testing

**Tools:** Jest, Supertest, MongoDB Memory Server (or test Atlas cluster)

### 4.1 Authentication APIs

| Endpoint | Test Scenarios |
|---|---|
| `POST /auth/register` | Valid input → 201 + tokens; duplicate email → 409; missing fields → 400; weak password → 400 |
| `POST /auth/login` | Valid credentials → 200 + tokens; wrong password → 401; non-existent email → 401 |
| `POST /auth/refresh-token` | Valid refresh token → new access token; expired token → 401; invalid token → 401 |
| `POST /auth/logout` | Valid token → 200, refresh token invalidated; already logged out → 200 |
| `POST /auth/forgot-password` | Valid email → 200 + email sent; non-existent email → 200 (no enumeration) |
| `POST /auth/reset-password` | Valid token + matching passwords → 200; expired token → 400; mismatched passwords → 400 |
| `GET /auth/me` | Valid token → user profile; no token → 401 |

### 4.2 Resume APIs

| Endpoint | Test Scenarios |
|---|---|
| `POST /resumes/upload` | Valid PDF → 201 + parsed sections; valid DOCX → 201; >5MB file → 413; wrong MIME → 415; unauthenticated → 401 |
| `GET /resumes` | Returns only authenticated user's resumes; empty list for new user; pagination works |
| `GET /resumes/:id` | Returns correct resume; another user's resume ID → 404; invalid ID format → 400 |
| `DELETE /resumes/:id` | Soft-deletes resume; another user's resume → 404; unauthenticated → 401 |
| `GET /resumes/:id/content` | Returns parsed sections for owned resume |

### 4.3 Analysis APIs

| Endpoint | Test Scenarios |
|---|---|
| `POST /resumes/:id/analysis` | Triggers analysis for owned resume → 202/200 + analysis result; another user's resume → 404; Gemini mock returns invalid JSON → retry logic triggers; Gemini mock fails 3 times → 503 returned |
| `GET /resumes/:id/analysis` | Returns latest analysis; no analysis yet → 404 |
| `GET /resumes/:id/analysis/history` | Returns all analysis versions in chronological order |

### 4.4 Reports APIs

| Endpoint | Test Scenarios |
|---|---|
| `POST /reports/generate` | Valid resumeId → generates PDF and returns download URL; missing resumeId → 400 |
| `GET /reports/:id/download` | Returns PDF binary with correct Content-Type; another user's report → 404 |
| `GET /reports` | Returns authenticated user's reports only |

### 4.5 Profile APIs

| Endpoint | Test Scenarios |
|---|---|
| `GET /profile` | Returns user profile for authenticated user |
| `PATCH /profile` | Valid updates persist; invalid fields ignored; unauthenticated → 401 |
| `POST /profile/avatar` | Valid image uploads; non-image file → 415; >2MB → 413 |

### 4.6 Settings APIs

| Endpoint | Test Scenarios |
|---|---|
| `PATCH /settings/preferences` | Valid theme/language/notification prefs saved; invalid values → 400 |
| `PATCH /settings/password` | Correct current password + valid new password → 200; wrong current password → 401 |
| `DELETE /settings/account` | Account soft-deleted; subsequent login → 401 |

### 4.7 Error Handling

- Missing `Authorization` header → 401 with standard error body (API.md §13)
- Malformed JWT → 401
- Invalid MongoDB ObjectId in URL params → 400 (not 500)
- Unhandled exception in controller → 500 with generic message (no stack trace in response body)
- Gemini timeout → 503 with `retryAfter` field
- All error responses match the standard error format in API.md §13

---

## 5. Database Testing

### 5.1 Collections

Verify that all collections defined in Database.md exist and have the correct structure:
- `users`
- `resumes`
- `analyses`
- `jobDescriptions`
- `coverLetters`
- `interviewPrep`
- `reports`
- `refreshTokens`

### 5.2 Indexes

Verify indexes are created and improve query performance:

| Collection | Index | Expected Behavior |
|---|---|---|
| `users` | `email` (unique) | Duplicate email registration rejected at DB level |
| `resumes` | `userId` | Resume list query uses index scan, not collection scan |
| `analyses` | `resumeId` | Analysis lookup by resume is fast |
| `refreshTokens` | `token` (unique), TTL on `expiresAt` | Expired tokens auto-deleted |

### 5.3 Relationships

- `resume.userId` references a valid `users._id`
- `analysis.resumeId` references a valid `resumes._id`
- Deleting a resume does not orphan analyses (soft delete or cascade handling tested)
- `refreshToken.userId` references a valid `users._id`

### 5.4 CRUD Operations

For each collection, verify:
- Create: document saved with all required fields; missing required field → validation error
- Read: correct document returned; wrong user's document not returned
- Update: only specified fields updated; `updatedAt` timestamp refreshed
- Delete (soft): `deletedAt` set, document not returned in normal queries

### 5.5 Validation

Mongoose schema validation is enforced:
- `user.email`: required, unique, valid email format
- `user.password`: required, min length enforced before hashing
- `resume.fileType`: must be `pdf` or `docx` (enum)
- `analysis.scores.ats`: must be 0–100 (min/max)
- `analysis.analysisType`: must be valid enum value

### 5.6 Performance

- Resume list query for a user with 50 resumes completes in < 100ms
- Analysis retrieval by `resumeId` completes in < 50ms
- Full-text or large document reads do not cause query timeout

---

## 6. AI Testing

### 6.1 Prompt Validation

- All prompts in AI-Prompts.md are sent exactly as specified; no accidental truncation
- Resume text is correctly interpolated into the prompt template
- JD text is correctly interpolated into the JD match prompt
- Target role and user data are correctly interpolated into cover letter and career prompts

### 6.2 JSON Validation

- AI response is parsed as JSON without errors for well-formed responses
- `zod` (or `ajv`) schema validation rejects responses missing required fields
- Schema validation rejects responses where score fields are outside 0–100 range
- Schema validation rejects responses with missing array fields (e.g., missing `keywords`)
- On schema failure, the error is logged and a retry is triggered (not an immediate 500)

### 6.3 Hallucination Detection

Since hallucination cannot be fully eliminated, the strategy is:
- All AI output is labeled as "AI Suggestions" in the UI (SRS §25)
- Scores are bounded to 0–100 by schema validation; values outside range cause a retry
- Keyword lists are checked for minimum length (≥ 1 item) — empty arrays trigger retry
- Section feedback is checked for minimum character length (≥ 10 chars) to detect empty/placeholder responses

### 6.4 Response Consistency

- Same resume content re-analyzed within cache window returns the cached result (not a new Gemini call)
- Different resume content produces a new analysis (cache miss confirmed by hash comparison)
- Two sequential analyses of the same resume produce scores within ±5 points (consistency check — informational, not a hard gate in V1)

### 6.5 Token Limits

- Resume text exceeding the configured character limit is truncated before sending to Gemini
- Truncation event is logged with resume ID and truncation length
- Truncated analysis still returns a valid, schema-conforming response

### 6.6 Rate Limiting

- Gemini rate limit response (429) triggers exponential backoff and retry
- After 3 retries, a `503 Service Unavailable` is returned to the client
- Rate limit events are logged for monitoring

### 6.7 Failure Recovery

- Gemini API returns 500 → retry up to 3 times
- Gemini API returns malformed JSON → retry up to 3 times
- All retries exhausted → `503` returned with `retryAfter` hint
- Cached analyses remain accessible during Gemini outage

### 6.8 Fallback Strategy

- If Gemini is unavailable, the system returns: `{ "error": "AI analysis temporarily unavailable. Please try again in a few minutes.", "retryAfter": 60 }`
- The frontend displays this as a user-friendly banner, not a crash
- Resume data is preserved — no re-upload needed after service recovery

---

## 7. Security Testing

### 7.1 JWT

| Test | Expected Result |
|---|---|
| Request with no Authorization header to protected endpoint | 401 Unauthorized |
| Request with expired access token | 401 Unauthorized |
| Request with tampered JWT signature | 401 Unauthorized |
| Request with valid access token | Passes auth middleware |
| Refresh token reuse after logout | 401 (token invalidated in DB) |
| Refresh token expired | 401 |

### 7.2 Authorization

| Test | Expected Result |
|---|---|
| User A requests User B's resume by ID | 404 (not 403, to avoid ID enumeration) |
| User A requests User B's analysis | 404 |
| User A attempts to delete User B's cover letter | 404 |
| Admin-only endpoint called by regular user (future) | 403 |

### 7.3 Input Validation

| Test | Expected Result |
|---|---|
| SQL injection string in email field | 400 Bad Request; string treated as literal text |
| XSS payload in JD text field (`<script>alert(1)</script>`) | Stored safely; sanitized on render; no script execution |
| Oversized JSON body (> body-parser limit) | 413 Payload Too Large |
| Unexpected extra fields in request body | Ignored (not stored); 200/201 returned |
| Null bytes in file upload | 400 Bad Request |

### 7.4 File Upload Security

| Test | Expected Result |
|---|---|
| Upload a `.exe` file disguised as `resume.pdf` | 415 Unsupported Media Type (MIME type checked, not just extension) |
| Upload a PDF > 5MB | 413 Payload Too Large |
| Upload a zero-byte file | 400 Bad Request |
| Upload a valid PDF | 201 Created |
| Upload a DOCX with embedded macros | Parsed safely; macros not executed (mammoth extracts text only) |

### 7.5 OWASP Top 10 Considerations

| OWASP Category | Control in Place |
|---|---|
| A01 Broken Access Control | User ownership check on all resource endpoints; no IDOR possible |
| A02 Cryptographic Failures | Passwords bcrypt-hashed; JWT uses HS256 with strong secret; HTTPS enforced in production |
| A03 Injection | `mongoose` parameterized queries; no raw string MongoDB queries; express-validator on all inputs |
| A04 Insecure Design | Auth flow designed with token invalidation; no security-by-obscurity |
| A05 Security Misconfiguration | Helmet.js sets secure HTTP headers; CORS restricted to production domain |
| A06 Vulnerable Components | `npm audit` run before every release; critical vulnerabilities block release |
| A07 Auth Failures | Rate limiting on login (5 attempts / 15 min per IP); no username enumeration |
| A08 Data Integrity Failures | JSON schema validation on all AI responses; file MIME type verification |
| A09 Logging Failures | All auth events, AI calls, and errors logged with timestamps |
| A10 SSRF | No user-supplied URLs are fetched server-side; Gemini API called with static endpoint only |

### 7.6 Rate Limiting

| Endpoint Group | Limit | Window |
|---|---|---|
| `POST /auth/login` | 5 requests | 15 minutes per IP |
| `POST /auth/register` | 10 requests | 1 hour per IP |
| `POST /resumes/upload` | 20 requests | 1 hour per user |
| `POST /resumes/:id/analysis` | 10 requests | 1 hour per user |
| All other authenticated endpoints | 100 requests | 15 minutes per user |

Verify: rate limit exceeded returns `429 Too Many Requests` with a `Retry-After` header.

### 7.7 CORS

- Production CORS allows only `https://<vercel-production-domain>`
- Preflight `OPTIONS` requests return correct `Access-Control-Allow-*` headers
- Requests from disallowed origins receive a CORS error (browser blocks the response)
- No wildcard (`*`) origin in production configuration

---

## 8. Performance Testing

### 8.1 API Response Time

Target: non-AI endpoints respond within 500ms at p95 under normal load.

| Endpoint | Expected Response Time |
|---|---|
| `GET /api/v1/health` | < 50ms |
| `POST /api/v1/auth/login` | < 300ms |
| `GET /api/v1/resumes` | < 300ms |
| `GET /api/v1/analytics/summary` | < 500ms |
| `POST /api/v1/resumes/upload` (PDF, 200KB) | < 2 seconds |
| `POST /api/v1/resumes/:id/analysis` | < 25 seconds |

### 8.2 Database Queries

- All queries use indexed fields; confirmed via MongoDB Atlas query profiler or `explain()`
- `db.resumes.find({ userId })` uses `userId` index (not collection scan)
- `db.analyses.find({ resumeId })` uses `resumeId` index

### 8.3 Large Resume Uploads

- Test with 4.9MB PDF (maximum allowed): upload completes within 5 seconds
- Parsing completes within 3 seconds for a 10-page DOCX
- No out-of-memory error on Node.js process for a 5MB file

### 8.4 Concurrent Users

Manual soak test with 10 concurrent users each triggering an analysis:
- All 10 analyses complete within 45 seconds
- No request fails with 500 (only expected 503 if rate-limited)
- MongoDB connection pool handles concurrent queries without error

### 8.5 AI Response Time

- Typical resume (1–2 pages) analysis: < 15 seconds
- Long resume (3 pages, dense text): < 25 seconds
- If Gemini exceeds 30 seconds, timeout is triggered and `503` returned

### 8.6 Caching

- Second analysis request for the same resume content returns cached result within 200ms (vs. 15–25 seconds for a live Gemini call)
- Cache hit/miss logged for observability
- Cache does not return stale data after resume content is updated

---

## 9. Edge Cases

| Edge Case | Input | Expected System Behavior |
|---|---|---|
| Invalid PDF (corrupted binary) | Upload a file renamed to `.pdf` but containing garbage bytes | `pdf-parse` throws; caught by error handler; `400 Bad Request` returned with user-friendly message |
| Scanned image PDF (no selectable text) | Upload a PDF created from scanned images | `pdf-parse` returns empty string; system detects empty extraction; `400` returned prompting text-based PDF |
| Corrupted DOCX | Upload a `.docx` with truncated ZIP structure | `mammoth` throws; caught; `400` returned |
| Large file at exactly 5MB boundary | Upload a 5,120KB PDF | Accepted (within limit) |
| Large file at 5MB + 1 byte | Upload a 5,121KB file | `413 Payload Too Large` |
| Empty resume (valid PDF, blank content) | Upload a blank PDF | Empty text extracted; AI prompt sent with empty resume; AI returns low scores; displayed without crash |
| Duplicate upload (same file, same user) | Upload same PDF twice | Second upload detected via SHA-256 hash; cached analysis returned; no duplicate document in DB |
| Duplicate upload (different user) | Two different users upload the same PDF | Treated as separate resumes; separate analyses; no cross-user data shared |
| Expired JWT on analysis request | Access token expired mid-session | Refresh token used to get new access token transparently; request retried |
| Gemini API failure during analysis | Gemini returns 500 on all 3 retries | `503 Service Unavailable` returned; resume data preserved; user can retry |
| Gemini API timeout | Gemini takes > 30 seconds | Request timeout triggered; `503` returned with `retryAfter: 60` |
| Slow network (upload) | Simulate 3G speed upload of 1MB file | Upload completes (may take 30+ seconds); progress indicator shown; no timeout |
| Very long JD text (>10,000 chars) | Paste a JD exceeding max length | `400 Bad Request` with validation message |
| XSS in resume filename | Upload `<script>alert(1)</script>.pdf` | Filename sanitized before storage; rendered as plain text in UI |
| Concurrent analysis requests (same resume) | Two tabs trigger analysis simultaneously | Second request returns cached result (or queued); no duplicate Gemini calls |
| Analysis for deleted resume | Resume soft-deleted; analysis endpoint called | `404 Not Found` |
| Token used after account deletion | Login attempted after account deleted | `401 Unauthorized` |

---

## 10. Test Cases

### Sample Test Cases — Critical Path

| Test ID | Feature | Scenario | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-001 | Registration | Valid registration creates user account | 1. POST `/api/v1/auth/register` with valid name, email, password | 201 Created; user document in DB; access + refresh tokens returned | Critical |
| TC-002 | Registration | Duplicate email rejected | 1. Register with email A. 2. Register again with email A | Second request returns 409 Conflict | Critical |
| TC-003 | Login | Valid credentials return tokens | 1. POST `/api/v1/auth/login` with correct email/password | 200 OK; accessToken and refreshToken returned | Critical |
| TC-004 | Login | Wrong password rejected | 1. POST `/api/v1/auth/login` with wrong password | 401 Unauthorized | Critical |
| TC-005 | Protected Route | Unauthenticated request blocked | 1. GET `/api/v1/resumes` with no Authorization header | 401 Unauthorized | Critical |
| TC-006 | Token Refresh | Expired access token refreshed | 1. Use expired accessToken. 2. POST `/api/v1/auth/refresh-token` with valid refreshToken | 200 OK; new accessToken returned | Critical |
| TC-007 | Resume Upload | Valid PDF accepted and parsed | 1. POST `/api/v1/resumes/upload` with a valid 1-page PDF | 201 Created; parsed text sections stored; resumeId returned | Critical |
| TC-008 | Resume Upload | File over 5MB rejected | 1. POST `/api/v1/resumes/upload` with a 6MB file | 413 Payload Too Large | Critical |
| TC-009 | Resume Upload | Wrong file type rejected | 1. POST `/api/v1/resumes/upload` with a `.txt` file | 415 Unsupported Media Type | Critical |
| TC-010 | Resume Upload | Scanned PDF detected | 1. POST `/api/v1/resumes/upload` with image-only PDF | 400 Bad Request; message prompts text-based PDF | High |
| TC-011 | AI Analysis | Analysis triggered and returned | 1. Upload PDF. 2. POST `/api/v1/resumes/:id/analysis` | 200/202; analysis result with all score dimensions stored and returned | Critical |
| TC-012 | AI Analysis | Malformed Gemini response triggers retry | 1. Mock Gemini to return invalid JSON. 2. Trigger analysis | Retry up to 3 times; after 3 failures, 503 returned | Critical |
| TC-013 | AI Analysis | Cached analysis returned on re-analysis | 1. Analyze resume. 2. Trigger analysis again for same resume | Second call returns cached result in < 500ms | High |
| TC-014 | Authorization | User cannot access another user's resume | 1. Login as User A. 2. GET `/api/v1/resumes/<User B resume ID>` | 404 Not Found | Critical |
| TC-015 | Dashboard | Stats cards render with real data | 1. Login. 2. Upload resume. 3. Run analysis. 4. Load dashboard | Stats cards show correct total resumes, ATS score, improvement delta | High |
| TC-016 | Charts | Radar chart renders analysis scores | 1. Complete an analysis. 2. View analysis results page | Radar chart displays 6 score dimensions with correct values | High |
| TC-017 | Job Match | JD matched against resume | 1. Upload resume. 2. Analyze. 3. POST `/api/v1/job-descriptions` with JD text. 4. POST `/api/v1/job-descriptions/:id/match` | Match score, matched keywords, and missing keywords returned | High |
| TC-018 | Cover Letter | Cover letter generated | 1. Upload resume. 2. POST `/api/v1/cover-letters/generate` with resumeId | 201 Created; cover letter text returned; persisted in DB | High |
| TC-019 | PDF Report | Report generates and downloads | 1. Upload resume. 2. Run analysis. 3. POST `/api/v1/reports/generate`. 4. GET `/api/v1/reports/:id/download` | PDF file returned with Content-Type `application/pdf` | High |
| TC-020 | Dark Mode | Theme toggle switches all UI elements | 1. Login. 2. Toggle to dark mode on Dashboard | All text, backgrounds, cards, and charts reflect dark theme | Medium |
| TC-021 | Mobile Responsive | Dashboard usable on 375px viewport | 1. Open dashboard at 375px width | No horizontal scroll; cards stack vertically; charts resize | High |
| TC-022 | Rate Limiting | Login rate limit enforced | 1. POST `/api/v1/auth/login` with wrong password 6 times within 15 minutes | 6th attempt returns 429 Too Many Requests | High |
| TC-023 | Password Reset | Reset flow works end-to-end | 1. Request reset. 2. Click email link (use token from DB in test). 3. Set new password. 4. Login with new password | Login succeeds with new password; old password rejected | High |
| TC-024 | Logout | Refresh token invalidated on logout | 1. Login. 2. POST `/api/v1/auth/logout`. 3. POST `/api/v1/auth/refresh-token` with old refresh token | 401 Unauthorized (token no longer valid) | Critical |
| TC-025 | Settings | Theme preference persists across sessions | 1. Set theme to dark. 2. Logout. 3. Login again | Dashboard loads in dark mode without re-toggling | Medium |

---

## 11. Bug Severity Matrix

### Critical

**Definition:** The bug makes core functionality completely unusable, causes data loss, exposes a security vulnerability, or causes a system crash. The application cannot be released with a Critical bug open.

**Examples:**
- User can access another user's resume data (broken authorization)
- Login returns 500 Internal Server Error for valid credentials
- Resume data silently deleted instead of soft-deleted
- JWT secret exposed in API response or logs
- Analysis results not persisted (lost on page refresh)

**Response:** Immediately halt development of new features; fix and re-test before proceeding.

---

### High

**Definition:** A significant feature is broken or produces wrong results, but the system doesn't crash and there is a workaround. The application should not be released with a High bug open unless explicitly accepted with a documented plan to fix in the next sprint.

**Examples:**
- ATS score displays 0 for all resumes due to parsing bug
- PDF report generates but is missing half the analysis sections
- Job match always returns "100% match" regardless of input
- File upload rejects valid 3MB PDFs incorrectly
- Charts fail to render on Firefox

**Response:** Fix within the current sprint; re-test before sprint review.

---

### Medium

**Definition:** A feature works but produces suboptimal UX, displays incorrect minor information, or has a non-breaking visual defect. The application can be released with documented Medium bugs if they are logged and scheduled.

**Examples:**
- Cover letter generator occasionally produces grammatically awkward sentences
- Dashboard charts flicker briefly on load
- Toast notification appears behind modal instead of on top
- Resume history list shows wrong date format in Safari

**Response:** Log in backlog; prioritize for the next sprint.

---

### Low

**Definition:** A cosmetic defect, spelling error, minor UX inconsistency, or edge-case behavior that affects very few users. Does not affect functionality.

**Examples:**
- A label is truncated with ellipsis at 768px but fully visible at 1024px
- "Analysing..." spinner has slightly wrong color in light mode
- Tooltip text has a minor wording inconsistency
- Padding is 2px off in one card component

**Response:** Log in backlog; fix during polish/tech-debt sprints; not a release blocker.

---

## 12. Release Validation Checklist

### Before Production Deployment

**Functional:**
- [ ] All critical path test cases (TC-001 through TC-025) pass
- [ ] All FR-01 through FR-20 (SRS §5) verified as implemented
- [ ] No Critical or High severity bugs open
- [ ] All API endpoints in API.md tested and returning expected responses
- [ ] AI analysis flow works end-to-end with real Gemini API (not just mocks)

**Security:**
- [ ] JWT auth enforced on all protected endpoints
- [ ] User ownership check verified for all resource endpoints
- [ ] Rate limiting active and tested
- [ ] `npm audit` shows zero critical or high severity CVEs
- [ ] No secrets in git history (`git log --all --full-history` checked)
- [ ] CORS restricted to production domain

**Performance:**
- [ ] Non-AI endpoints respond within 500ms in the staging environment
- [ ] AI analysis completes within 25 seconds for a typical resume on staging

**Quality:**
- [ ] Backend unit + integration test suite passes with 0 failures
- [ ] Frontend component tests pass with 0 failures
- [ ] Manual cross-browser testing completed (Chrome, Firefox, Edge, Safari)
- [ ] Manual mobile testing completed (375px, 768px)

---

### Before Deployment (Deployment Steps)

- [ ] Production environment variables verified against `.env.example`
- [ ] MongoDB Atlas production cluster confirmed healthy
- [ ] Backend deployed and health check (`GET /api/v1/health`) returns `200`
- [ ] Frontend deployed and loads without console errors
- [ ] CORS header confirmed: response includes `Access-Control-Allow-Origin: https://<production-domain>`

---

### After Deployment

- [ ] Smoke tests executed in production (see Section 2.6)
- [ ] Sentry shows no unexpected errors in the first 30 minutes post-deploy
- [ ] Uptime monitoring confirms 200 status on health check endpoint
- [ ] End-to-end user journey executed manually in production: register → upload → analyze → download report
- [ ] MongoDB Atlas shows active connections from production backend
- [ ] No unexpected spike in error logs

---

## 13. Quality Metrics

| Metric | Definition | Target | Measurement Method |
|---|---|---|---|
| **Test Coverage** | Percentage of backend code lines exercised by unit + integration tests | ≥ 70% | `jest --coverage` report |
| **Test Pass Rate** | Percentage of test cases passing at release gate | 100% of Critical and High tests | Jest test results |
| **Bug Density** | Number of bugs found per phase / feature | < 2 High bugs per phase | Bug log / GitHub Issues |
| **Critical Bug Count at Release** | Number of Critical bugs open at time of production deploy | 0 | Bug tracking |
| **API Response Time (p95)** | 95th percentile response time for non-AI endpoints | < 500ms | Manual timing / logs |
| **AI Analysis Time (avg)** | Average end-to-end analysis completion time | < 20 seconds | Server logs |
| **AI Analysis Success Rate** | Percentage of analysis requests that return a valid result | ≥ 98% | Server logs |
| **AI JSON Validation Pass Rate** | Percentage of Gemini responses that pass schema validation on first attempt | ≥ 90% | Retry log analysis |
| **User Satisfaction (informal)** | Qualitative feedback from beta users | Majority positive | User interviews / feedback form |
| **Error Rate in Production** | Percentage of API requests resulting in 5xx errors | < 0.5% | Sentry / server logs |

---

## 14. Future Testing Strategy

### 14.1 Automated End-to-End Testing (Phase 2)

Implement Playwright or Cypress for automated browser-level E2E tests covering:
- Full registration → analysis → report download journey
- Job match flow
- Cover letter generation
- Theme switching across pages

E2E tests to run on every PR merge to `develop` via GitHub Actions.

### 14.2 CI/CD Testing Pipeline

Set up GitHub Actions workflow:
1. On every push to a `feature/*` branch: run unit tests
2. On every PR to `develop`: run unit tests + integration tests + linting
3. On merge to `develop`: run full test suite + deploy to staging + run smoke tests
4. On merge to `main`: run full test suite + deploy to production + run smoke tests

### 14.3 Performance Monitoring

- Integrate Datadog or New Relic APM for continuous response time and error rate monitoring
- Set up alerts for: p95 response time > 1 second, error rate > 1%, Gemini API failure rate > 5%
- Monthly performance review comparing metrics against targets in Section 13

### 14.4 AI Regression Testing

As Gemini model versions are updated (e.g., `gemini-1.5-pro` → `gemini-2.0-pro`):
- Maintain a library of 10–20 canonical resume fixtures with known expected score ranges
- Run AI regression suite against new model version before upgrading
- Flag any score deviation > ±10 points from baseline for human review
- Treat AI model upgrades as a minor release requiring a full regression test pass

### 14.5 Security Audits

- Run `npm audit` on every dependency update
- Conduct a manual OWASP Top 10 review before every minor release
- Engage an external penetration test before v1.0.0 launch (or at 1,000 users milestone)
- Review and rotate JWT secrets and API keys every 90 days
- Subscribe to GitHub Dependabot alerts for automatic vulnerability notifications