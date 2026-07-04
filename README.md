# AI Resume Analyzer & Career Assistant

A production-ready, AI-powered career assistant platform that parses, evaluates, and optimizes resumes using Google Gemini AI. The platform simulates the judgment of an experienced recruiter and Applicant Tracking System (ATS), providing multi-dimensional scoring, segment-by-segment critiques, tailored cover letters, custom interview preparation, and automated career roadmap suggestions.

---

## 🚀 Key Features (Phased Roadmap)

- **Phase 1: Project Initialization**: Production-grade monorepo setup, environment validation, health check APIs, design system setup.
- **Phase 2: Authentication**: Secure, stateful JWT session management (access & refresh tokens via secure httpOnly cookies).
- **Phase 3: Resume Management**: Secure PDF/DOCX resume file upload, parsing, text segmentation, and version history.
- **Phase 4: AI Core Engine**: Deep evaluation using Google Gemini models, structured JSON outputs, 3-stage validation, and exponential backoff retry mechanisms.
- **Phase 5: Results Dashboard**: Dynamic metrics dashboard with Recharts visualization, theme toggle, and downloadable PDF reports.
- **Phase 6: Job Description Matching**: Paste job descriptions for instant match scores, keyword gap analyses, and actionable checklist updates.
- **Phase 7: Generative Enhancements**: Automated custom cover letter drafting, interactive Q&A interview prep, and career pathing recommendations.
- **Phase 8: Profile & Settings**: User preferences, theme persistence, and profile details.

---

## 🛠️ Tech Stack

- **Frontend**: React (SPA), Vite, Tailwind CSS, React Router, Recharts, Axios, Lucide Icons, React Hot Toast
- **Backend**: Node.js, Express.js, Winston (logger), Helmet (security), Express Rate Limit, Multer, `pdf-parse`, `mammoth`
- **Database**: MongoDB Atlas via Mongoose ODM
- **AI Engine**: Google Gemini API (`gemini-1.5-pro` & `gemini-1.5-flash`)
- **Testing**: Jest + Supertest (Backend), Vitest + React Testing Library (Frontend)

---

## 📁 Repository Structure

```
ai-resume-analyzer/
├── frontend/             # React SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/   # Shared & feature-specific components
│   │   ├── context/      # Theme and Auth context providers
│   │   ├── hooks/        # Custom React hooks (useTheme, useAuth, etc.)
│   │   ├── pages/        # Page views (Landing, Dashboard, Analysis, etc.)
│   │   ├── routes/       # Route guards & configurations
│   │   ├── services/     # API service layers (Axios instances)
│   │   └── utils/        # Global utilities & constants
│   └── vite.config.js    # Vite configuration
│
├── backend/              # Express REST API
│   ├── src/
│   │   ├── config/       # Databases, environments, mail config
│   │   ├── controllers/  # Route controller controllers
│   │   ├── middlewares/  # Express middlewares (auth, upload, errors, rate limits)
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # Route endpoints
│   │   ├── services/     # Core services (AI orchestrator, parser, pdf kit)
│   │   └── utils/        # Shared helper scripts (logger, formatters)
│   └── src/server.js     # Server entry point
│
└── docs/                 # Official product specifications
```

---

## ⚙️ Local Development Setup

### Prerequisites

- Node.js (>=20.x LTS)
- MongoDB local instance or MongoDB Atlas Connection String
- Gemini API Key

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your local or remote variables (specifically `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `GEMINI_API_KEY`).
4. Install backend dependencies:
   ```bash
   npm install
   ```
5. Run the development server (with hot-reload):
   ```bash
   npm run dev
   ```
   The backend will be running at `http://localhost:5000` with the health check available at `/api/v1/health`.

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Install frontend dependencies:
   ```bash
   npm install
   ```
4. Run the React development server:
   ```bash
   npm run dev
   ```
   The frontend will be running at `http://localhost:5173`.

---

## 🧪 Testing

### Backend tests
```bash
cd backend
npm test
```

### Frontend tests
```bash
cd frontend
npm test
```
