import { Link, Navigate } from 'react-router-dom';
import { BrainCircuit, FileText, Target, Mail, MessageSquareText, Compass, BarChart2, Upload, Sparkles } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';

/**
 * LandingPage — Public marketing / hero page.
 * Shows features, how it works, and CTAs.
 *
 * Reference: Implementation-Guide.md §4.1, UI-Guide.md (Landing section),
 *            SRS §9 Step 1, SRS §12 (Feature Breakdown)
 * Rule: Functional component + hooks, Tailwind only (PROJECT_RULES.md)
 */

const FEATURES = [
  {
    id: 'ai-analysis',
    icon: BrainCircuit,
    title: 'AI Resume Analysis',
    description:
      'Get recruiter-quality feedback across ATS compatibility, grammar, formatting, and every resume section.',
  },
  {
    id: 'ats-score',
    icon: BarChart2,
    title: 'ATS Score',
    description:
      'Know exactly how your resume performs against Applicant Tracking Systems before you hit submit.',
  },
  {
    id: 'job-match',
    icon: Target,
    title: 'Job Description Match',
    description:
      'Paste any job description and instantly see your match score, missing keywords, and tailoring suggestions.',
  },
  {
    id: 'cover-letter',
    icon: Mail,
    title: 'Cover Letter Generator',
    description:
      'Generate tailored, professional cover letters in multiple tones — ready to copy or download.',
  },
  {
    id: 'interview-prep',
    icon: MessageSquareText,
    title: 'Interview Preparation',
    description:
      'Get role-specific technical and behavioral interview questions with suggested answer approaches.',
  },
  {
    id: 'career-roadmap',
    icon: Compass,
    title: 'Career Roadmap',
    description:
      'Receive personalized skill, certification, and project recommendations to reach your target role.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Your Resume',
    description: 'Drag and drop your PDF or DOCX resume. We support files up to 5MB.',
  },
  {
    step: '02',
    icon: Sparkles,
    title: 'AI Analyses It',
    description:
      'Our Gemini-powered engine evaluates your resume across 10+ dimensions in under 25 seconds.',
  },
  {
    step: '03',
    icon: FileText,
    title: 'Improve & Export',
    description:
      'Act on structured feedback, generate career content, and download a full PDF report.',
  },
];

const LandingPage = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" strokeWidth={1.75} />
            <span className="text-h3 font-semibold text-text-primary">ResumeAI</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-md p-2 text-icon-default hover:bg-surface-alt hover:text-text-primary"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <Link
              to={ROUTES.LOGIN}
              className="rounded-md px-4 py-2 text-btn font-semibold text-text-secondary hover:text-text-primary"
            >
              Sign in
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="rounded-md bg-primary px-4 py-2 text-btn font-semibold text-white hover:bg-primary-hover"
            >
              Get started free
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-content px-6 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 text-caption font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Google Gemini AI
          </div>

          <h1 className="mb-6 text-display font-bold leading-tight text-text-primary">
            Get Recruiter-Quality{' '}
            <span className="text-primary">Resume Feedback</span>{' '}
            in Seconds
          </h1>

          <p className="mb-8 text-body-lg text-text-secondary">
            Upload your resume and receive instant AI-powered analysis — ATS scores,
            grammar checks, missing keywords, tailored cover letters, interview questions,
            and a personalised career roadmap. All in one platform.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to={ROUTES.REGISTER}
              id="hero-cta-primary"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-btn font-semibold text-white hover:bg-primary-hover"
            >
              Analyse my resume free
            </Link>
            <Link
              to="#how-it-works"
              id="hero-cta-secondary"
              className="inline-flex items-center gap-2 rounded-md border border-border-strong px-6 py-3 text-btn font-semibold text-text-secondary hover:border-text-muted hover:text-text-primary"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="border-t border-border bg-surface-alt py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-h1 font-bold text-text-primary">
              Everything you need to land your next role
            </h2>
            <p className="text-body-lg text-text-secondary">
              Six AI-powered tools, one intelligent platform.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ id, icon: Icon, title, description }) => (
              <div
                key={id}
                id={`feature-${id}`}
                className="rounded-lg border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-md bg-primary-light p-2.5">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 text-h3 font-semibold text-text-primary">{title}</h3>
                <p className="text-body text-text-secondary">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16">
        <div className="mx-auto max-w-content px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-h1 font-bold text-text-primary">How it works</h2>
            <p className="text-body-lg text-text-secondary">
              From upload to improvement in three simple steps.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="mb-1 text-caption font-semibold uppercase tracking-widest text-primary">
                  Step {step}
                </div>
                <h3 className="mb-2 text-h3 font-semibold text-text-primary">{title}</h3>
                <p className="text-body text-text-secondary">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-primary py-16">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="mb-4 text-h1 font-bold text-white">
            Ready to transform your resume?
          </h2>
          <p className="mb-8 text-body-lg text-white/80">
            Join thousands of job seekers getting smarter, faster feedback.
          </p>
          <Link
            to={ROUTES.REGISTER}
            id="cta-bottom"
            className="inline-flex items-center gap-2 rounded-md bg-white px-8 py-3 text-btn font-semibold text-primary hover:bg-primary-light"
          >
            Get started — it&apos;s free
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-content px-6 text-center">
          <p className="text-caption text-text-muted">
            © {new Date().getFullYear()} ResumeAI. Built with Google Gemini AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
