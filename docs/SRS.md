# Software Requirements Specification (SRS)
## AI Resume Analyzer & Career Assistant

**Document Version:** 1.0
**Document Type:** Software Requirements Specification
**Status:** Draft for Development

---

## 1. Executive Summary

The **AI Resume Analyzer & Career Assistant** is a SaaS web platform that uses generative AI to evaluate, score, and improve resumes for students, freshers, and working professionals. Unlike basic keyword-matching resume scanners, this platform simulates the judgment of an experienced HR recruiter combined with an Applicant Tracking System (ATS), producing structured, multi-dimensional feedback across grammar, formatting, skills, experience, and ATS compatibility.

Beyond analysis, the platform acts as an end-to-end **career assistant** — generating tailored cover letters, predicting likely interview questions, matching resumes against specific job descriptions, and offering a personalized career roadmap with recommended certifications and projects.

The system is built on a modern JavaScript stack (React, Node.js, MongoDB) with Google Gemini API as the AI reasoning engine, and is designed for horizontal scalability, responsive UI/UX, and enterprise-style security practices despite targeting an initially consumer-facing audience.

---

## 2. Problem Statement

| Problem | Impact |
|---|---|
| Most job seekers do not know whether their resume will pass ATS filters | Qualified candidates get auto-rejected before a human ever sees their resume |
| Generic resume checkers give shallow, rule-based feedback (e.g., "add more keywords") | Users don't get qualitative, recruiter-style insight into resume strength |
| Tailoring a resume to each job description is time-consuming | Users send generic resumes, lowering response rates |
| Writing a cover letter, anticipating interview questions, and planning career growth are disconnected tasks | Users must juggle multiple tools (Grammarly, ChatGPT, separate ATS checkers, separate interview prep apps) |
| Students/freshers lack access to mentorship-level career guidance | Career decisions (skills to learn, certifications, projects) are made with poor information |

**Core Problem:** There is no single, intelligent platform that combines resume analysis, ATS scoring, job-matching, cover letter generation, interview preparation, and career guidance into one cohesive AI-powered experience.

---

## 3. Project Objectives

1. Provide instant, AI-driven, recruiter-quality resume feedback.
2. Calculate an accurate, explainable ATS compatibility score.
3. Identify missing skills/keywords relative to a target job description.
4. Generate tailored cover letters and likely interview questions automatically.
5. Offer a structured career roadmap (skills, certifications, projects) based on the user's profile.
6. Allow users to track resume improvement over time (version history & progress).
7. Deliver a polished, modern SaaS UI with dark/light mode and smooth UX.
8. Build an architecture that can scale from MVP to a premium subscription product.

---

## 4. Scope

### In Scope (V1)
- Resume upload (PDF/DOCX), parsing, and structured extraction.
- AI-powered analysis returning structured JSON (scores + qualitative feedback).
- ATS score, grammar score, formatting score.
- Job description matching with gap analysis.
- Cover letter generation.
- Interview question generation.
- Career recommendations (skills, certifications, projects).
- Resume history, progress tracking, PDF report export.
- Authentication (JWT-based), profile, and settings management.
- Dark/light themed, responsive dashboard.

### Out of Scope (V1, planned for later)
- AI mock interview (voice/video).
- LinkedIn/GitHub/portfolio analysis.
- Multi-language resume support.
- Resume template builder (drag-and-drop builder).
- Team/enterprise/recruiter-facing dashboards.

---

## 5. Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | The system shall allow users to register using email/password. |
| FR-02 | The system shall allow users to log in and receive a JWT session token. |
| FR-03 | The system shall support a "Forgot Password" flow via email reset link. |
| FR-04 | The system shall allow authenticated users to upload a resume in PDF or DOCX format (max 5MB). |
| FR-05 | The system shall parse uploaded resumes into structured text/sections. |
| FR-06 | The system shall send parsed resume content to the AI engine for analysis. |
| FR-07 | The AI shall return a structured JSON object containing all analysis dimensions (Section 16). |
| FR-08 | The system shall persist each analysis result linked to the resume version and user. |
| FR-09 | The system shall display analysis results across independently rendered dashboard cards/sections. |
| FR-10 | The system shall allow users to paste a job description and receive a match score and gap analysis. |
| FR-11 | The system shall generate a tailored cover letter based on resume + (optional) job description. |
| FR-12 | The system shall generate role-relevant interview questions (technical + behavioral). |
| FR-13 | The system shall provide AI-suggested resume rewrites/improvements per section. |
| FR-14 | The system shall maintain a history of all uploaded resumes and their analyses. |
| FR-15 | The system shall track score progression across resume versions (progress tracking). |
| FR-16 | The system shall generate a downloadable PDF report summarizing the full analysis. |
| FR-17 | The system shall allow users to update profile information and account settings. |
| FR-18 | The system shall support dark mode and light mode, persisted per user/browser. |
| FR-19 | The system shall display charts (radar/bar/line) for score breakdowns using Recharts. |
| FR-20 | The system shall validate file type/size on upload and reject unsupported formats gracefully. |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Resume parsing + AI analysis should complete within 15–25 seconds for typical resumes. |
| Usability | UI shall be intuitive enough for first-time users without onboarding tutorials. |
| Availability | Target 99.5% uptime for production environment. |
| Scalability | Backend services shall be stateless and horizontally scalable. |
| Security | All sensitive data (passwords, tokens) shall be encrypted/hashed; resumes stored securely. |
| Maintainability | Codebase shall follow modular, layered architecture (controllers/services/models). |
| Portability | Frontend and backend shall be deployable independently (Vercel + Railway/Render). |
| Accessibility | UI shall meet WCAG 2.1 AA where feasible (contrast, keyboard nav, ARIA labels). |
| Compatibility | Application shall support latest two versions of Chrome, Firefox, Edge, Safari. |
| Observability | System shall log errors and key events for debugging and monitoring. |

---

## 7. User Personas

### Persona 1: "Riya" — College Student
- Final-year CS student, no work experience.
- Needs help structuring a resume with projects/academic achievements.
- Goal: Get an internship; doesn't know what recruiters look for.

### Persona 2: "Aman" — Fresh Graduate / Job Seeker
- Recently graduated, actively applying to multiple companies.
- Needs ATS optimization and tailored resumes per job description.
- Goal: Increase interview call rate.

### Persona 3: "Priya" — Working Professional
- 4 years' experience, looking to switch jobs/roles.
- Needs help repositioning experience, quantifying achievements, and prepping for interviews.
- Goal: Land a higher-paying or more senior role.

### Persona 4: "Dev" — Software Developer
- Technically strong, weak at self-marketing and writing.
- Needs help with professional summary, action verbs, and project descriptions.
- Goal: Make technical work sound impactful to non-technical recruiters.

---

## 8. User Roles

| Role | Description | Permissions |
|---|---|---|
| Guest | Unauthenticated visitor | View landing page, pricing, register/login |
| Registered User | Standard authenticated user | Upload resumes, run analyses, generate reports, manage own data |
| Admin (internal) | Platform administrator | Monitor usage, manage flagged content, view system health (not user-facing in V1) |

> Note: V1 has no recruiter/enterprise role — this is reserved for future enhancements.

---

## 9. Complete User Journey

1. **Landing Page** – User learns about the product, sees feature highlights and CTA.
2. **Registration** – User signs up with email/password (validation + duplicate check).
3. **Login** – User authenticates; receives JWT; redirected to Dashboard.
4. **Dashboard (Empty State)** – Prompts user to upload their first resume.
5. **Upload Resume** – User uploads PDF/DOCX via drag-and-drop or file picker.
6. **Parsing** – Backend extracts raw text and structures it into sections.
7. **AI Analysis** – Parsed resume sent to Gemini API; structured JSON returned.
8. **Results Dashboard** – Scores, charts, and feedback rendered across cards/tabs.
9. **Improve Resume** – User views AI suggestions per section (summary, skills, experience).
10. **Job Description Match (optional)** – User pastes a JD; gets match score + gaps.
11. **Generate Cover Letter** – One-click generation based on resume (+ JD if provided).
12. **Interview Prep** – User views generated interview questions by category.
13. **Download Report** – User exports a consolidated PDF report.
14. **Track Progress** – User re-uploads an improved resume; system shows score delta over time.
15. **Settings/Profile** – User manages account details, theme preference, password.

---

## 10. System Architecture Overview

**Architecture Style:** Three-tier, client-server, RESTful API architecture with a stateless backend and an external AI service integration.

```
┌─────────────────────────┐
│   Client (React SPA)     │
│  Vercel Hosted Frontend  │
└───────────┬──────────────┘
            │ HTTPS / REST (JWT in headers)
┌───────────▼──────────────┐
│   API Layer (Express.js) │
│  Hosted on Railway/Render│
│  - Auth Service           │
│  - Resume Service         │
│  - AI Orchestration Layer │
│  - Report Service         │
└───────────┬──────────────┘
            │
   ┌────────┼─────────────┐
   │                       │
┌──▼─────────┐     ┌───────▼─────────┐
│ MongoDB     │     │ Google Gemini   │
│ Atlas (DB)  │     │ API (AI Engine) │
└─────────────┘     └─────────────────┘
            │
   ┌────────▼─────────┐
   │ File Storage      │
   │ (Resume binaries) │
   └───────────────────┘
```

**Key architectural principles:**
- Stateless backend → horizontal scaling via load balancer.
- AI calls isolated in a dedicated service/module to allow provider swapping (e.g., Gemini → another LLM) without touching business logic.
- Resume parsing decoupled from AI analysis (parse first, then analyze) to allow caching/re-analysis without re-parsing.
- Separation of concerns: Controllers → Services → Models (MVC-inspired, service-layer pattern).

---

## 11. High-Level Workflow

1. **Ingestion:** File uploaded → validated → stored (cloud storage or DB-referenced path) → metadata saved.
2. **Extraction:** `pdf-parse`/`mammoth` extract raw text → text cleaned/normalized → segmented into logical sections (heuristics + regex/NLP cues).
3. **AI Orchestration:** Structured prompt (resume text + schema instructions) sent to Gemini API.
4. **Response Handling:** AI JSON response validated against expected schema → persisted → returned to frontend.
5. **Rendering:** Frontend consumes JSON and renders independent UI sections/cards/charts.
6. **Derived Features:** JD matching, cover letter, and interview questions are separate AI calls reusing the parsed resume + (optionally) the existing analysis as context.
7. **Reporting:** All structured data aggregated into a single payload → rendered to PDF via report-generation service.

---

## 12. Feature Breakdown

| Feature | Description | Priority |
|---|---|---|
| Authentication (Register/Login/Forgot Password) | JWT-based secure auth | Must-have |
| Resume Upload & Storage | PDF/DOCX upload, validated, stored | Must-have |
| Resume Parsing | Extract structured text from file | Must-have |
| AI Resume Analysis | Full structured scoring + feedback | Must-have |
| ATS Score | Numeric score (0–100) with explanation | Must-have |
| Grammar & Formatting Analysis | Identify errors, formatting issues | Must-have |
| Skills/Projects/Experience/Education Review | Section-wise qualitative feedback | Must-have |
| Missing Keywords/Skills Detection | Gap identification vs. industry norms or JD | Must-have |
| JD Matching | Resume vs. job description comparison | Should-have |
| Resume Rewrite Suggestions | AI-suggested improved phrasing | Should-have |
| Cover Letter Generator | AI-generated, tailored cover letter | Should-have |
| Interview Question Generator | Role-based Q&A prep | Should-have |
| Career Recommendations | Certifications, projects, roadmap | Should-have |
| Resume History & Progress Tracking | Version comparison over time | Should-have |
| PDF Report Download | Exportable consolidated report | Should-have |
| Dark/Light Mode | Theme toggle | Nice-to-have (but specified as core) |
| Analytics Dashboard | Visual charts of scores/trends | Should-have |

---

## 13. Module Breakdown

1. **Authentication Module** – Registration, login, password reset, JWT issuance/validation.
2. **Landing Module** – Marketing/informational pages (public).
3. **Dashboard Module** – Central hub aggregating resumes, scores, quick actions.
4. **Resume Upload Module** – File intake, validation, storage handling.
5. **Resume Parsing Module** – Text extraction and section segmentation.
6. **AI Analysis Module** – Prompt construction, Gemini API calls, response parsing/validation.
7. **ATS Scoring Module** – Score computation/interpretation logic (AI-driven, with optional rule-based cross-checks).
8. **Feedback Module** – Rendering of grammar/formatting/skills/experience feedback.
9. **JD Matching Module** – Job description input, comparison logic, gap report.
10. **Resume Rewrite Module** – Section-level AI rewrite suggestions.
11. **Cover Letter Module** – AI-generated letter, editable/exportable.
12. **Interview Prep Module** – Question generation by category/difficulty.
13. **Career Recommendation Module** – Roadmap, certifications, project suggestions.
14. **Analytics Module** – Score trends, charts, comparative history.
15. **Profile & Settings Module** – User data management, preferences.
16. **Report Generation Module** – Aggregation + PDF export.

---

## 14. Database Design (Collections and Fields)

### 14.1 `users`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| name | String | Required |
| email | String | Unique, required, indexed |
| passwordHash | String | bcrypt hashed |
| authProvider | String | "local" (future: "google", etc.) |
| theme | String | "light" / "dark" |
| createdAt | Date | |
| updatedAt | Date | |
| resetPasswordToken | String | nullable |
| resetPasswordExpires | Date | nullable |

### 14.2 `resumes`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| userId | ObjectId | Ref → users |
| fileName | String | Original filename |
| fileUrl | String | Storage path/URL |
| fileType | String | "pdf" / "docx" |
| rawText | String | Extracted plain text |
| parsedSections | Object | { summary, skills, experience, education, projects, certifications } |
| version | Number | Incremented per re-upload |
| uploadedAt | Date | |

### 14.3 `analyses`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| resumeId | ObjectId | Ref → resumes |
| userId | ObjectId | Ref → users |
| atsScore | Number | 0–100 |
| grammarScore | Number | 0–100 |
| formattingScore | Number | 0–100 |
| overallScore | Number | 0–100 (weighted composite) |
| strengths | [String] | |
| weaknesses | [String] | |
| missingSkills | [String] | |
| missingKeywords | [String] | |
| actionVerbsUsed | [String] | |
| sectionReviews | Object | { summary, skills, projects, experience, education, achievements } |
| careerSuggestions | Object | { certifications: [String], projects: [String], roadmap: [String] } |
| interviewQuestions | [Object] | { question, category, difficulty } |
| salaryEstimate | Object | { min, max, currency, basis } |
| rawAiResponse | Object | Full stored JSON for auditability |
| createdAt | Date | |

### 14.4 `jdMatches`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| resumeId | ObjectId | Ref → resumes |
| userId | ObjectId | Ref → users |
| jobDescriptionText | String | |
| matchScore | Number | 0–100 |
| missingKeywords | [String] | |
| missingSkills | [String] | |
| importantTechnologies | [String] | |
| suggestions | [String] | |
| createdAt | Date | |

### 14.5 `coverLetters`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| resumeId | ObjectId | Ref → resumes |
| userId | ObjectId | Ref → users |
| jdMatchId | ObjectId | nullable, ref → jdMatches |
| content | String | Generated letter text |
| createdAt | Date | |

### 14.6 `reports`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| userId | ObjectId | Ref → users |
| resumeId | ObjectId | Ref → resumes |
| analysisId | ObjectId | Ref → analyses |
| fileUrl | String | Generated PDF location |
| generatedAt | Date | |

### 14.7 `activityLogs` (optional, for progress tracking)
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| userId | ObjectId | |
| action | String | e.g., "RESUME_UPLOADED", "ANALYSIS_COMPLETED" |
| metadata | Object | |
| createdAt | Date | |

---

## 15. API Design (Endpoint List with Purpose)

### Authentication
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/login` | Authenticate user, issue JWT |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password via token |
| GET | `/api/auth/me` | Get current authenticated user |

### Resume
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/resumes/upload` | Upload and store resume file |
| GET | `/api/resumes` | List all resumes for current user |
| GET | `/api/resumes/:id` | Get single resume details |
| DELETE | `/api/resumes/:id` | Delete a resume |
| GET | `/api/resumes/:id/preview` | Get parsed text/preview |

### AI Analysis
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/analysis/:resumeId` | Trigger AI analysis for a resume |
| GET | `/api/analysis/:resumeId` | Retrieve latest analysis |
| GET | `/api/analysis/:resumeId/history` | Retrieve analysis history (progress tracking) |

### Job Description Matching
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/jd-match/:resumeId` | Submit JD text, get match analysis |
| GET | `/api/jd-match/:id` | Retrieve a specific JD match result |

### Cover Letter
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/cover-letter/:resumeId` | Generate cover letter |
| GET | `/api/cover-letter/:id` | Retrieve generated cover letter |

### Interview Questions
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/interview-questions/:resumeId` | Generate interview questions |
| GET | `/api/interview-questions/:resumeId` | Retrieve saved questions |

### Reports
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/reports/:analysisId/generate` | Generate downloadable PDF report |
| GET | `/api/reports/:id/download` | Download report file |

### Profile/Settings
| Method | Endpoint | Purpose |
|---|---|---|
| PUT | `/api/users/profile` | Update profile info |
| PUT | `/api/users/theme` | Update theme preference |
| PUT | `/api/users/password` | Change password |

---

## 16. AI Processing Workflow

1. **Input Assembly:** Combine `rawText` (and `parsedSections` if available) into a structured prompt template.
2. **Schema Enforcement:** Prompt explicitly instructs the model to return **only valid JSON** matching a predefined schema (no prose, no markdown fences).
3. **API Call:** Backend calls Google Gemini API with the prompt; timeout and retry logic applied (e.g., 2 retries with exponential backoff).
4. **Response Validation:** JSON response parsed and validated against a schema (e.g., using a validation library) to ensure all required fields are present and correctly typed.
5. **Fallback Handling:** If the AI response is malformed, the system retries once with a corrective follow-up prompt; if it still fails, a user-facing error is returned ("Analysis failed, please try again").
6. **Persistence:** Validated JSON is mapped into the `analyses` collection schema and saved.
7. **Response to Client:** Backend returns the structured JSON to the frontend for independent section rendering.

**Expected AI Output Schema (conceptual):**
```json
{
  "overallScore": 0,
  "atsScore": 0,
  "grammarScore": 0,
  "formattingScore": 0,
  "professionalSummaryReview": "",
  "skillsReview": "",
  "projectsReview": "",
  "experienceReview": "",
  "educationReview": "",
  "achievementsReview": "",
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "missingKeywords": [],
  "actionVerbsUsed": [],
  "careerSuggestions": {
    "certifications": [],
    "projects": [],
    "roadmap": []
  },
  "interviewQuestions": [
    { "question": "", "category": "", "difficulty": "" }
  ],
  "salaryEstimate": { "min": 0, "max": 0, "currency": "", "basis": "" }
}
```

---

## 17. Resume Parsing Workflow

1. **File Type Detection:** Determine if uploaded file is PDF or DOCX based on MIME type/extension.
2. **Text Extraction:**
   - PDF → `pdf-parse` extracts raw text (page-by-page concatenation).
   - DOCX → `mammoth` converts document to plain text/HTML, then text is extracted.
3. **Text Cleaning:** Remove excessive whitespace, fix line-break artifacts, normalize bullet characters.
4. **Section Segmentation:** Heuristic/regex-based detection of common headers (e.g., "Experience", "Education", "Skills", "Projects", "Certifications") to split text into a `parsedSections` object.
5. **Edge Case Handling:**
   - Scanned/image-based PDFs with no extractable text → flagged as "unsupported format, please upload a text-based PDF."
   - Missing standard section headers → fallback to AI-assisted segmentation (send raw text to AI with instruction to segment into sections).
6. **Storage:** Both `rawText` and `parsedSections` are saved against the resume record for reuse across multiple AI features (analysis, JD matching, cover letter).

---

## 18. Dashboard Layout Description

**Layout Structure:**
- **Top Navbar:** Logo, navigation links (Dashboard, History, Settings), theme toggle, profile dropdown.
- **Sidebar (Desktop) / Bottom Nav or Drawer (Mobile):** Quick links — Dashboard, Upload, History, Job Match, Cover Letters, Interview Prep, Settings.
- **Main Dashboard Area:**
  - **Header Section:** Welcome message, last analysis date, quick "Upload New Resume" CTA.
  - **Score Summary Cards:** Overall Score, ATS Score, Grammar Score, Formatting Score (large numeric cards with color-coded status — red/yellow/green).
  - **Charts Section:** Radar chart (multi-dimensional score breakdown), bar chart (section-wise scores), line chart (progress over time across versions).
  - **Section Feedback Tabs/Accordions:** Summary, Skills, Projects, Experience, Education, Achievements — each expandable with AI feedback text.
  - **Missing Keywords/Skills Panel:** Tag-style chips showing gaps.
  - **Action Panel:** Buttons for "Generate Cover Letter," "Match Job Description," "View Interview Questions," "Download Report."
  - **Recent Resumes List:** Card/table view of previously uploaded resumes with quick-view scores.
- **Responsive Behavior:** Sidebar collapses to icons on tablet; collapses to a bottom nav/hamburger drawer on mobile. Charts stack vertically on small screens.

---

## 19. Security Considerations

- **Password Security:** Passwords hashed using bcrypt (salted, cost factor ≥ 10).
- **Authentication:** JWT with short-lived access tokens; refresh token strategy recommended for session longevity.
- **Authorization:** Middleware enforces that users can only access/modify their own resumes/analyses/reports.
- **File Upload Security:** Strict MIME-type and extension validation; file size limits (≤5MB); virus/malware scanning recommended for production.
- **Input Sanitization:** All user input (including job description text) sanitized to prevent injection attacks.
- **Rate Limiting:** API rate limiting on auth endpoints and AI-triggering endpoints to prevent abuse and control AI API costs.
- **CORS Policy:** Restrict allowed origins to the deployed frontend domain(s).
- **Secrets Management:** API keys (Gemini, JWT secret, DB URI) stored in environment variables, never committed to source control.
- **Data Privacy:** Resume content is personal data — encrypt at rest where possible; provide a "Delete My Data" account option.
- **HTTPS Enforcement:** All traffic served over TLS in production.
- **Prompt Injection Mitigation:** Sanitize resume/JD text before inserting into AI prompts to reduce risk of prompt injection affecting AI behavior.

---

## 20. Performance Considerations

- Use asynchronous, non-blocking I/O for file parsing and AI calls.
- Cache parsed resume text to avoid re-parsing on repeated analysis requests.
- Implement loading states/skeleton screens on frontend during AI processing (15–25s expected latency).
- Use pagination for resume history and analysis history lists.
- Optimize MongoDB queries with proper indexing (`userId`, `resumeId`, `createdAt`).
- Compress and lazy-load frontend assets; code-split routes using React Router.
- Consider a job queue (e.g., BullMQ + Redis) for AI processing in future versions to avoid blocking request threads under load.

---

## 21. Scalability Considerations

- **Stateless API servers** enable horizontal scaling behind a load balancer.
- **MongoDB Atlas** supports vertical and horizontal scaling (sharding) as data grows.
- **AI Service Abstraction Layer** allows switching/load-balancing across multiple AI providers or API keys if Gemini rate limits are hit.
- **File Storage** should be offloaded to object storage (e.g., S3-compatible) rather than local disk for multi-instance deployments.
- **Caching Layer** (Redis) can be introduced for frequently accessed data (user sessions, recent analyses).
- **Background Job Processing** (queue-based) recommended once concurrent AI request volume increases.

---

## 22. Deployment Architecture

| Component | Platform | Notes |
|---|---|---|
| Frontend (React SPA) | Vercel | CI/CD via Git integration, automatic preview deployments |
| Backend (Node.js/Express API) | Railway or Render | Environment variables for secrets, auto-restart on crash |
| Database | MongoDB Atlas | Managed, automated backups, network access rules (IP allowlist) |
| File Storage | Cloud object storage (e.g., S3-compatible) or DB-backed storage for MVP | Recommended migration path to object storage post-MVP |
| AI Provider | Google Gemini API | Called server-side only; API key never exposed to client |
| Monitoring | Platform-native logging (Railway/Render) + optional external APM (e.g., Sentry) | Error tracking and uptime monitoring |

**Environments:** `development`, `staging`, `production` — each with isolated database instances and environment variable sets.

---

## 23. Future Enhancements

| Feature | Description |
|---|---|
| AI Mock Interview | Voice/video-based simulated interview with real-time AI feedback |
| Portfolio Analysis | AI review of personal portfolio websites |
| LinkedIn Analysis | Profile completeness and optimization scoring |
| GitHub Analysis | Code quality/repo activity review for developer resumes |
| Resume Heatmap | Visual attention/readability heatmap simulation |
| Resume Version Comparison | Side-by-side diff of two resume versions with score deltas |
| 30-Day Learning Roadmap | Structured day-by-day upskilling plan |
| AI Chat Assistant | Conversational career-advice chatbot |
| Resume Templates | Pre-built, ATS-friendly resume templates with builder UI |
| Multi-language Resume Support | Analysis support for non-English resumes |

---

## 24. Assumptions

- Users will primarily upload text-based (non-scanned) PDF or DOCX resumes.
- Google Gemini API will reliably return well-structured JSON when properly prompted (with validation/retry as a safety net).
- Users have access to modern browsers supporting ES6+ JavaScript.
- Initial user base size will not require complex queueing infrastructure (manageable via direct synchronous AI calls in MVP).
- Job description text provided by users is in English and reasonably well-formed.
- Pricing/monetization model (freemium, subscription, etc.) will be defined in a later business-requirements phase; this SRS focuses on functional product design.

---

## 25. Risks and Limitations

| Risk | Mitigation |
|---|---|
| AI returns malformed/incomplete JSON | Schema validation + retry logic + graceful error UI |
| AI hallucination in feedback (inaccurate suggestions) | Frame AI output as "suggestions," allow user judgment; consider human-reviewed examples in prompt for grounding |
| Scanned/image PDFs cannot be parsed | Detect empty extraction and prompt user to upload a text-based file; OCR support as future enhancement |
| Gemini API rate limits/downtime | Implement retries, backoff, and a fallback "service temporarily unavailable" state |
| Rising AI API costs at scale | Implement usage caps per user/plan tier; cache repeated analyses |
| Sensitive personal data in resumes (privacy risk) | Encryption at rest, strict access control, data deletion option |
| Inconsistent resume formats break parsing heuristics | AI-assisted fallback segmentation when heuristics fail |
| Vendor lock-in to a single LLM provider | Abstract AI calls behind a service interface for provider flexibility |

---

## 26. Development Roadmap (MVP → Advanced → Premium)

### Phase 1 — MVP
- Authentication (register/login/forgot password)
- Resume upload + parsing
- Core AI analysis (ATS score, grammar, formatting, section reviews)
- Results dashboard with charts
- Resume history (basic list)
- Dark/light mode

### Phase 2 — Advanced
- Job description matching
- Cover letter generator
- Interview question generator
- Resume rewrite suggestions
- PDF report download
- Progress tracking (score over time)
- Career recommendations (certifications/projects/roadmap)

### Phase 3 — Premium
- AI Mock Interview module
- LinkedIn/GitHub/Portfolio analysis
- Resume version comparison & heatmap
- AI chat assistant
- Resume template builder
- Multi-language support
- Subscription/billing tiers with usage limits

---

## 27. Suggested Folder Structure

```
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
│   │   ├── services/        # API call wrappers
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── ai/           # Gemini integration layer
│   │   │   ├── parsing/       # pdf-parse / mammoth logic
│   │   │   └── report/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   │   ├── auth.js
│   │   │   ├── upload.js
│   │   │   └── errorHandler.js
│   │   ├── utils/
│   │   └── server.js
│   └── package.json
│
└── README.md
```

---

## 28. Success Metrics

| Metric | Target/Purpose |
|---|---|
| Resume Analysis Completion Rate | % of uploads that successfully complete AI analysis |
| Average Analysis Turnaround Time | Target < 25 seconds end-to-end |
| User Retention (7-day, 30-day) | Indicates ongoing value perception |
| Resumes per User | Indicates engagement and iterative improvement behavior |
| Average ATS Score Improvement (V1 → V2 resume) | Demonstrates product effectiveness |
| Cover Letter / Interview Prep Feature Adoption Rate | % of analyzed users using secondary features |
| Report Download Rate | Indicates perceived value of consolidated output |
| Error/Failure Rate on AI Calls | Should remain below an acceptable threshold (e.g., <2%) |

---

## 29. Conclusion

The **AI Resume Analyzer & Career Assistant** is designed to go beyond a simple resume checker by functioning as a holistic, AI-powered career companion. Its architecture — a decoupled parsing layer, a schema-enforced AI orchestration layer, and a modular dashboard frontend — ensures the system can scale in both functionality and user load over time.

By starting with a focused MVP (core analysis and ATS scoring) and progressively layering in job-matching, generative content (cover letters, interview prep), and long-term career guidance, the product can evolve from a utility tool into a daily-use career growth platform. This SRS provides the structural and functional blueprint required for a development team to begin implementation with minimal ambiguity.