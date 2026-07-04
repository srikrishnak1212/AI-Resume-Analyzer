# UI/UX Design Specification
## AI Resume Analyzer & Career Assistant

**Document Type:** UI/UX Design Specification
**Reference:** Software Requirements Specification (SRS) v1.0
**Audience:** Frontend developers, AI coding tools, designers

---

## 1. Design Philosophy

The product should feel like a **calm, intelligent workspace** — not a flashy marketing tool. The visual language borrows from best-in-class SaaS dashboards (Linear's precision, Notion's whitespace, Stripe's data clarity, Vercel's monochrome confidence, ChatGPT's conversational simplicity).

**Core principles:**
- **Clarity over decoration** — every visual element earns its place.
- **Data-first** — scores, charts, and feedback are the heroes; chrome stays quiet.
- **Consistency** — one spacing scale, one type scale, one set of motion rules, applied everywhere.
- **Trust through restraint** — muted palette, soft shadows, no gradients-for-the-sake-of-gradients, no oversized illustrations.
- **AI-native feel** — subtle "thinking" states, streaming-style reveals, and gentle motion communicate intelligence without gimmicks.

---

## 2. Color System

### 2.1 Light Mode

| Token | HEX | Usage |
|---|---|---|
| `primary` | `#4F46E5` | Primary buttons, active nav, links, focus rings |
| `primary-hover` | `#4338CA` | Hover state for primary actions |
| `primary-light` | `#EEF2FF` | Primary tinted backgrounds, selected states |
| `secondary` | `#0EA5E9` | Secondary accents, info highlights, AI badges |
| `secondary-light` | `#E0F2FE` | Secondary tinted backgrounds |
| `success` | `#16A34A` | High scores, success alerts, positive deltas |
| `success-light` | `#DCFCE7` | Success badge backgrounds |
| `warning` | `#D97706` | Medium scores, caution alerts |
| `warning-light` | `#FEF3C7` | Warning badge backgrounds |
| `danger` | `#DC2626` | Low scores, errors, destructive actions |
| `danger-light` | `#FEE2E2` | Error badge/alert backgrounds |
| `info` | `#2563EB` | Informational banners, tooltips |
| `background` | `#F8FAFC` | App background (body) |
| `surface` | `#FFFFFF` | Cards, modals, panels |
| `surface-alt` | `#F1F5F9` | Sidebar, secondary panels, table stripes |
| `border` | `#E2E8F0` | Card borders, dividers |
| `border-strong` | `#CBD5E1` | Input borders, emphasized dividers |
| `text-primary` | `#0F172A` | Headings, primary text |
| `text-secondary` | `#475569` | Body text, descriptions |
| `text-muted` | `#94A3B8` | Placeholders, captions, disabled text |
| `icon-default` | `#64748B` | Default icon color |
| `icon-active` | `#4F46E5` | Active/selected icon color |

### 2.2 Dark Mode

| Token | HEX | Usage |
|---|---|---|
| `primary` | `#6366F1` | Primary buttons, active nav, links |
| `primary-hover` | `#818CF8` | Hover state for primary actions |
| `primary-light` | `#1E1B4B` | Primary tinted backgrounds |
| `secondary` | `#38BDF8` | Secondary accents, AI badges |
| `secondary-light` | `#0C4A6E` | Secondary tinted backgrounds |
| `success` | `#22C55E` | High scores, success states |
| `success-light` | `#14532D` | Success badge backgrounds |
| `warning` | `#F59E0B` | Medium scores, caution states |
| `warning-light` | `#78350F` | Warning badge backgrounds |
| `danger` | `#EF4444` | Low scores, errors |
| `danger-light` | `#7F1D1D` | Error badge backgrounds |
| `info` | `#3B82F6` | Informational elements |
| `background` | `#0B0F19` | App background (body) |
| `surface` | `#111827` | Cards, modals, panels |
| `surface-alt` | `#1A2233` | Sidebar, secondary panels |
| `border` | `#1F2937` | Card borders, dividers |
| `border-strong` | `#334155` | Input borders |
| `text-primary` | `#F1F5F9` | Headings, primary text |
| `text-secondary` | `#94A3B8` | Body text |
| `text-muted` | `#64748B` | Placeholders, captions |
| `icon-default` | `#94A3B8` | Default icon color |
| `icon-active` | `#818CF8` | Active/selected icon color |

### 2.3 Chart Color Set (consistent across light/dark)

| Series | HEX | Used for |
|---|---|---|
| Chart 1 | `#4F46E5` | ATS Score |
| Chart 2 | `#0EA5E9` | Grammar Score |
| Chart 3 | `#22C55E` | Formatting Score |
| Chart 4 | `#F59E0B` | Skills Match |
| Chart 5 | `#EC4899` | Experience Score |
| Chart 6 | `#94A3B8` | Neutral/baseline lines |

> Score color-coding rule (applies to badges, progress bars, score rings everywhere):
> - **0–49** → `danger`
> - **50–74** → `warning`
> - **75–100** → `success`

---

## 3. Typography

**Font Family:**
- Primary: **Inter** (UI text, body, labels) — excellent legibility at small sizes, used by Linear/Vercel/GitHub.
- Monospace (optional, for technical fields like file names, scores in tables): **JetBrains Mono** or **IBM Plex Mono**.

### 3.1 Type Scale

| Style | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Display | 36px | 700 (Bold) | 44px | Landing hero headline |
| H1 | 28px | 700 (Bold) | 36px | Page titles (Dashboard, Analysis) |
| H2 | 22px | 600 (Semibold) | 30px | Section headers within a page |
| H3 | 18px | 600 (Semibold) | 26px | Card titles |
| Body Large | 16px | 400 (Regular) | 24px | Primary body copy |
| Body | 14px | 400 (Regular) | 20px | Default UI text |
| Body Small | 13px | 400 (Regular) | 18px | Secondary descriptions |
| Caption | 12px | 500 (Medium) | 16px | Captions, timestamps, helper text |
| Label | 13px | 600 (Semibold) | 16px, letter-spacing 0.02em | Input labels, table headers (uppercase optional) |
| Button Text | 14px | 600 (Semibold) | — | All button labels |
| Sidebar/Nav Text | 14px | 500 (Medium) | 20px | Sidebar links, top nav items |

### 3.2 Usage Guidance
- Card titles: H3, `text-primary`, paired with an icon (20px) to the left.
- Input labels: Label style, `text-secondary`, 6px margin-bottom from the input.
- Buttons: Sentence case (not ALL CAPS), 14px Semibold, no underlines.
- Numbers/Scores: Use a larger weight (700) and slightly larger size (e.g., 32–40px) when displayed as a hero metric (e.g., "82/100" on a score card).

---

## 4. Icon System

**Recommended Library:** **Lucide Icons** (lightweight, consistent stroke width, free, matches the Linear/Vercel aesthetic). Stroke width: 1.75–2px. Default size: 20px (nav/sidebar), 18px (inline/buttons), 24px (empty states/feature highlights).

| Function | Icon (Lucide name) |
|---|---|
| Dashboard | `layout-dashboard` |
| Upload | `upload-cloud` |
| Resume | `file-text` |
| Analysis | `bar-chart-2` or `scan-search` |
| Reports | `file-bar-chart` |
| Profile | `user-circle` |
| Settings | `settings` |
| Logout | `log-out` |
| Career / Roadmap | `compass` |
| Interview | `message-square-text` |
| Cover Letter | `mail` |
| Job Match | `target` |
| History | `history` |
| Notifications | `bell` |
| Theme Toggle | `sun` / `moon` |
| Success | `check-circle-2` |
| Warning | `alert-triangle` |
| Error | `x-circle` |
| Info | `info` |
| Download | `download` |
| Delete | `trash-2` |
| Search | `search` |

---

## 5. Design System Foundations

### 5.1 Spacing Scale (4px base unit)

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Icon-to-text gaps |
| `space-2` | 8px | Tight element spacing |
| `space-3` | 12px | Form field internal padding |
| `space-4` | 16px | Default card padding (mobile), inter-element gaps |
| `space-5` | 20px | Default card padding (desktop) |
| `space-6` | 24px | Section spacing within a page |
| `space-8` | 32px | Spacing between major page sections |
| `space-10` | 40px | Page top/bottom margins |
| `space-12` | 48px | Landing page section spacing |
| `space-16` | 64px | Hero section vertical spacing |

### 5.2 Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 6px | Badges, chips, small buttons |
| `radius-md` | 10px | Inputs, default buttons |
| `radius-lg` | 14px | Cards, panels |
| `radius-xl` | 20px | Modals, large feature cards |
| `radius-full` | 9999px | Avatars, pill badges, toggle switches |

### 5.3 Shadow System

| Token | Value (approx.) | Usage |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(15,23,42,0.04)` | Subtle card resting state |
| `shadow-sm` | `0 2px 6px rgba(15,23,42,0.06)` | Default cards |
| `shadow-md` | `0 6px 16px rgba(15,23,42,0.08)` | Hover state on cards, dropdowns |
| `shadow-lg` | `0 12px 28px rgba(15,23,42,0.12)` | Modals, popovers |
| `shadow-focus` | `0 0 0 3px rgba(79,70,229,0.25)` | Focus rings (accessibility) |

> Dark mode shadows should use lower opacity black + a subtle 1px border (`border` token) instead of relying purely on shadow, since shadows are less visible on dark backgrounds.

### 5.4 Grid System

- **Desktop (≥1280px):** 12-column grid, max content width 1440px, 24px gutters, 64px outer margins.
- **Laptop (1024–1279px):** 12-column grid, 20px gutters, 40px outer margins.
- **Tablet (768–1023px):** 8-column grid, 16px gutters, 24px outer margins. Sidebar collapses to icon-only or drawer.
- **Mobile (<768px):** 4-column grid, 16px gutters, 16px outer margins. Single-column stacking for all dashboard cards/charts.

### 5.5 Button Variants

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| Primary | `primary` | White | none | Main CTA per page (1 per view) |
| Secondary | `surface` | `text-primary` | `border-strong` | Secondary actions |
| Ghost | transparent | `text-secondary` | none | Tertiary/inline actions |
| Destructive | `danger` | White | none | Delete, remove, sign-out confirmation |
| Disabled | `surface-alt` | `text-muted` | `border` | Inactive state |

**States:** default → hover (darken 8%/lighten 8% in dark mode) → active (darken 12%) → focus (shadow-focus ring) → disabled (50% opacity, no pointer events).
**Sizes:** Small (32px height), Default (40px height), Large (48px height, landing CTAs).

### 5.6 Input Variants

- **Default:** 1px `border-strong`, `radius-md`, 12px horizontal padding, 40px height, `surface` background.
- **Focused:** border becomes `primary`, `shadow-focus` ring applied.
- **Error:** border becomes `danger`, helper text in `danger` below field.
- **Disabled:** `surface-alt` background, `text-muted` text, no border emphasis.
- **Textarea (Job Description input):** min-height 160px, resizable vertically, same border/focus rules.

### 5.7 Card Variants

| Variant | Description |
|---|---|
| Standard Card | `surface` bg, `radius-lg`, `shadow-sm`, 20–24px padding |
| Stat Card | Standard card + large numeric value (H1-scale) + label + trend indicator (↑/↓ with color) |
| Interactive Card | Standard card + hover → `shadow-md` + slight translateY(-2px) |
| Outlined Card | Transparent bg, 1px `border`, used for nested/secondary content inside another card |

### 5.8 Animation Guidelines

- **Library:** Framer Motion (per SRS tech stack).
- **Duration:** 150–250ms for micro-interactions (hover, button press); 300–400ms for page/section transitions; 500–700ms for AI "reveal" animations (score counting up, charts drawing in).
- **Easing:** `ease-out` for entrances, `ease-in-out` for state toggles (dark/light mode, accordion expand/collapse).
- **Patterns:**
  - Score numbers count up from 0 to final value on first render.
  - Cards fade-in + slight upward translate (8px) on page load, staggered by 50ms per card.
  - Sidebar active-item indicator slides smoothly between nav items.
  - Toasts slide in from top-right (desktop) / bottom (mobile), auto-dismiss after 4s.
- **Reduced Motion:** Respect `prefers-reduced-motion` — disable translate/scale animations, keep only opacity fades.

---

## 6. Reusable Components

### 6.1 Navbar (Top)
- Height: 64px. Contains: logo (left), global search (optional, center on wide screens), theme toggle, notification bell, profile avatar dropdown (right).
- Sticky on scroll, `surface` background with `shadow-xs` once scrolled.
- Mobile: collapses search and shows a hamburger menu trigger for the sidebar drawer.

### 6.2 Sidebar
- Width: 240px (expanded), 72px (collapsed/icon-only).
- Sections: Logo/App name at top, primary nav (Dashboard, Upload, History, Job Match, Cover Letters, Interview Prep), divider, secondary nav (Settings, Logout) at bottom.
- Active item: `primary-light` background pill, `primary` icon/text, left accent bar (3px, `primary`).
- Collapsible via toggle icon; state persisted in user settings.

### 6.3 Cards — see 5.7 Card Variants.

### 6.4 Buttons — see 5.5 Button Variants.

### 6.5 Input Fields — see 5.6 Input Variants. Includes text input, textarea, select dropdown, checkbox, radio, toggle switch (for dark mode and settings).

### 6.6 Upload Area
- Large dashed-border (`border-strong`, 2px dashed) drop zone, `radius-lg`, min-height 220px.
- Center content: upload-cloud icon (32px), "Drag & drop your resume here" (Body Large), "or" divider, "Browse Files" secondary button, helper caption "PDF or DOCX, max 5MB."
- Drag-over state: border becomes solid `primary`, background tints `primary-light`.
- After file selected: replaced by a file-preview row (file icon, filename, size, remove "x" button) + progress bar.

### 6.7 Progress Bars
- Linear progress bar: 8px height, `radius-full`, track in `surface-alt`, fill in `primary` (or score-color when representing a score).
- Circular score ring: used for ATS/Overall score hero metric — stroke 8px, animated fill on load, score number centered inside.

### 6.8 Charts (Recharts)
- Radar Chart: multi-axis score breakdown (ATS, Grammar, Formatting, Skills, Experience).
- Bar Chart: section-wise scores comparison.
- Line Chart: score progression across resume versions (progress tracking).
- Donut/Pie: keyword match ratio (matched vs. missing).
- All charts use the Chart Color Set (Section 2.3), gridlines in `border`, tooltips styled as small `surface` cards with `shadow-md`.

### 6.9 Tables
- Header row: `surface-alt` background, Label-style text, `text-secondary`.
- Row height: 48px, alternating row tint optional (`surface` / `surface-alt` at low opacity).
- Hover row: subtle `primary-light` tint.
- Used in: Resume History, Reports list.

### 6.10 Badges
- Pill-shaped (`radius-full`), 4px vertical / 10px horizontal padding, Caption-weight text.
- Variants: Success (green), Warning (amber), Danger (red), Info (blue), Neutral (gray) — matching the score color-coding rule.

### 6.11 Alerts (Inline Banners)
- Full-width, `radius-md`, left icon + message + optional dismiss "x".
- Background uses the `-light` tint of the relevant color (success/warning/danger/info), left 3px accent border in the solid color.

### 6.12 Toast Notifications
- Compact card, `shadow-lg`, `radius-md`, icon + message + optional action link + close button.
- Position: top-right (desktop), top-center (mobile). Auto-dismiss 4s, pause-on-hover.

### 6.13 Loading States
- **Skeleton screens** for cards/charts/tables (animated shimmer, `surface-alt` → slightly lighter, 1.5s loop).
- **AI Processing State:** dedicated full-section loader with a subtle pulsing icon (e.g., `scan-search`) and rotating status text ("Reading resume...", "Analyzing structure...", "Generating insights...") to communicate active AI work during the 15–25s analysis window.
- **Inline spinners** for buttons mid-action (replace label with spinner, disable click).

### 6.14 Empty States
- Centered illustration-free layout: icon (40px, `text-muted`) + H3 message + Body Small description + primary CTA button.
- Example: "No resumes yet" → upload icon → "Upload your first resume to get started" → "Upload Resume" button.

### 6.15 Error States
- Similar to empty state but icon in `danger`, message explains what went wrong, includes a "Retry" secondary button and (where relevant) a "Contact Support" ghost button.

### 6.16 Modals & Dialogs
- Centered, `radius-xl`, `shadow-lg`, max-width 480px (confirmation) to 640px (forms).
- Overlay: `rgba(15,23,42,0.5)` (light) / `rgba(0,0,0,0.6)` (dark), blur optional (4px backdrop-blur).
- Structure: Header (title + close icon), body content, footer (right-aligned action buttons — Cancel ghost + Confirm primary/destructive).
- Used for: Delete resume confirmation, logout confirmation, JD paste modal (alternative to inline textarea).

---

## 7. Page-by-Page Specifications

### 7.1 Landing Page

**Purpose:** Convert visitors into registered users by communicating value clearly and quickly.

**Sections:**
- **Hero:** H1-Display headline ("Your AI Career Coach for the Perfect Resume"), supporting Body Large subtext, primary CTA ("Get Started Free") + ghost CTA ("See How It Works"). Right side: a static product screenshot/mock of the dashboard (no animation needed, clean static image in a soft-shadowed browser frame).
- **Features Section:** 3–4 column grid (stacks to 1 column mobile) — each feature card: icon, H3 title, Body Small description. Features: "AI Resume Analysis," "ATS Score," "Job Description Matching," "Cover Letter & Interview Prep."
- **Testimonials:** 3-card carousel (desktop) / swipeable stack (mobile) — avatar, name, role, quote (Body, italic optional).
- **Pricing (Future):** Placeholder section with "Coming Soon" badge — simple 2–3 tier card layout reserved for future monetization.
- **FAQ:** Accordion list, single-column, max-width 720px centered.
- **Final CTA:** Centered band with `primary-light` or `surface-alt` background, H2 + primary button.
- **Footer:** 4-column link layout (Product, Company, Resources, Legal) + social icons + copyright line.

**Responsive:** Hero becomes single-column stacked (image below text) on tablet/mobile; feature grid 3→2→1 columns; testimonials become a horizontal scroll-snap carousel on mobile.

---

### 7.2 Login Page

**Purpose:** Authenticate returning users.
**Layout:** Centered single card (max-width 420px) on a subtle `background` canvas, logo above the card.
**Components:** Email input, password input (with show/hide toggle icon), "Forgot password?" link (right-aligned, Caption size), primary "Log In" button (full width), divider "or", link to Register page below the card.
**User Actions:** Submit login, navigate to Forgot Password, navigate to Register.
**Validation:** Inline error messages below each field (danger text, Caption size); top-of-card alert banner for server errors ("Invalid email or password").
**Responsive:** Card remains centered and full-width-minus-margin on mobile (e.g., 90% width, max 400px).

---

### 7.3 Register Page

**Purpose:** New user account creation.
**Layout:** Same centered-card pattern as Login.
**Components:** Name, Email, Password, Confirm Password inputs; password strength indicator (thin segmented bar below password field, color-coded weak/medium/strong); Terms checkbox + link; primary "Create Account" button; link to Login.
**Validation:** Real-time password match check, email format check, inline error states per field.
**Responsive:** Identical centered-card behavior as Login.

---

### 7.4 Forgot Password Page

**Purpose:** Initiate password reset.
**Layout:** Centered card, simpler than Login — single email input + primary "Send Reset Link" button + "Back to Login" link.
**Post-submit state:** Card content replaces with a success state (check-circle icon + "Check your email" message) rather than navigating away.
**Responsive:** Same centered-card pattern.

---

### 7.5 Dashboard

**Purpose:** Central hub summarizing the user's resume health and quick access to all features.

**Layout (Desktop):**
- Sidebar (240px) + main content area.
- Main content top: Greeting header ("Welcome back, Riya") + "Upload New Resume" primary button (top-right).
- Row 1: Stat cards — Overall Score, ATS Score, Grammar Score, Formatting Score (4-column grid of Stat Cards with circular mini progress rings).
- Row 2: Two-column split — Left: Radar/Bar chart (score breakdown); Right: Line chart (progress over time, or empty state if only one resume exists).
- Row 3: Recent Resumes table (filename, date, ATS score badge, action menu) + "View All" link.
- Row 4: Quick Actions card row — "Match a Job Description," "Generate Cover Letter," "View Interview Questions," "Download Report" (icon + label tiles).
- Profile card (in sidebar footer or top navbar dropdown): avatar, name, plan tier, settings/logout shortcuts.

**Components:** Stat Cards, Charts, Table, Quick Action tiles, Empty state (for first-time users with no resumes).
**User Actions:** Upload resume, view past analysis, jump to any sub-feature, open profile/settings.
**Navigation:** Sidebar persistent; clicking any stat card or chart navigates to the relevant Analysis page section.

**Tablet:** Stat cards 4→2 columns; charts stack vertically; sidebar collapses to icon-only (expandable via toggle).
**Mobile:** Sidebar becomes a slide-in drawer (triggered from top navbar hamburger); stat cards become a horizontal scroll-snap row or stack 1-per-row; charts stack full-width; table converts to a stacked card list (one card per resume row).

---

### 7.6 Upload Resume Page

**Purpose:** Let users upload a new resume for analysis.
**Layout:** Centered, focused single-column layout (max-width 640px) — minimal distraction.
**Components:** Page title ("Upload Your Resume"), Upload Area component (Section 6.6), supported format icons (PDF/DOCX badges) below the drop zone, "Analyze Resume" primary button (disabled until a file is selected/uploaded).
**Flow:** Drag/drop or browse → file preview row with progress bar → on success, show check-circle + filename + "Analyze Resume" button enabled → on click, navigate to Analysis page with AI Processing loading state.
**Validation:** File type/size errors shown as an inline Alert (danger) directly below the upload area.
**Responsive:** Drop zone min-height reduces slightly on mobile (180px); button becomes full-width.

---

### 7.7 Analysis Page

**Purpose:** Display the full structured AI analysis of a resume.

**Layout:**
- Header: Resume filename + version + "Re-analyze" / "Download Report" buttons (top-right).
- Hero Row: Overall Score (large circular ring, center-left) + 3 smaller Stat Cards (ATS, Grammar, Formatting) beside it.
- Charts Row: Radar chart (score breakdown across dimensions).
- **Section Analysis (Tabs or Accordion):** Skills Analysis, Projects Analysis, Experience Analysis, Education Analysis — each a card with a short AI-written review (Body text) + relevant chips (e.g., detected skills as badges).
- **Keyword Analysis Card:** Two-column chip layout — "Present Keywords" (success badges) vs. "Missing Keywords" (danger/outline badges).
- **Strengths / Weaknesses Card:** Two-column list, checkmark bullets (success) for strengths, warning-triangle bullets for weaknesses.
- **Suggestions Card:** Numbered list of actionable AI suggestions, each with a "Copy" or "Apply" ghost button (future rewrite integration).
- Footer action row: "Match Job Description," "Generate Cover Letter," "View Interview Questions" buttons.

**Loading State:** Full-page AI Processing loader (Section 6.13) shown immediately after upload, before any data exists.
**Responsive:** Tabs convert to accordions on mobile; hero row stacks (score ring on top, stat cards in a 2x2 grid below); charts full-width; keyword chips wrap naturally.

---

### 7.8 Resume Preview Page

**Purpose:** Let users view the parsed/extracted resume content alongside metadata.
**Layout:** Two-column (desktop) — left: rendered resume preview (PDF viewer embed or styled plain-text rendering of `parsedSections`); right: sticky metadata panel (upload date, file type, version, quick score summary, "Re-upload" button).
**Components:** PDF/text viewer, metadata sidebar card, section anchor links (Summary, Skills, Experience, etc. — jump-to-section navigation).
**Responsive:** Single column on tablet/mobile — metadata panel moves above the preview as a collapsible card.

---

### 7.9 Job Description Match Page

**Purpose:** Compare a resume against a specific job description.
**Layout:** Top: large textarea input ("Paste the job description here") + "Analyze Match" primary button. Below (post-analysis): results section.
**Results Components:** Match Score (circular ring, color-coded), "Missing Keywords" badge list, "Missing Skills" badge list, "Important Technologies" tag list, "Suggestions" card (numbered list).
**User Actions:** Paste/edit JD, re-run analysis, proceed to "Generate Tailored Cover Letter" CTA.
**Empty State:** Before first run — illustration-free prompt: target icon + "Paste a job description to see how well your resume matches."
**Responsive:** Textarea full-width always; results cards stack single-column on mobile.

---

### 7.10 Resume Rewrite Page

**Purpose:** Show AI-suggested rewrites per resume section.
**Layout:** Single column, section-by-section cards (Summary, Experience bullet points, Skills, Projects). Each card shows "Original" (left/top, muted background) vs. "AI Suggested" (right/bottom, `primary-light` background) in a two-column comparison (stacks vertically on mobile) with a "Copy Suggestion" ghost button per card.
**User Actions:** Copy individual suggestions, "Regenerate" icon button per card to request an alternative rewrite.
**Responsive:** Two-column comparison becomes stacked Original-then-Suggested on tablet/mobile.

---

### 7.11 Cover Letter Page

**Purpose:** Generate and review an AI-written cover letter.
**Layout:** Left: generation controls panel (select resume version, optional linked JD match, tone selector — Professional/Friendly/Concise, "Generate" button). Right (or below on mobile): generated letter displayed in an editable textarea/rich-text card with "Copy," "Download as PDF/DOCX," and "Regenerate" actions.
**Loading State:** Inline AI Processing shimmer inside the letter card while generating.
**Responsive:** Controls panel moves above the letter content on mobile; both full-width.

---

### 7.12 Interview Questions Page

**Purpose:** Present AI-generated interview questions tailored to the resume/role.
**Layout:** Filter bar at top (category tabs: Technical, Behavioral, Role-Specific; difficulty filter chips: Easy/Medium/Hard). Below: accordion list of questions — each row expands to reveal a suggested answer approach/tips (Body Small).
**Components:** Filter chips, Accordion list, Badge for difficulty level per question.
**User Actions:** Filter by category/difficulty, expand/collapse questions, "Regenerate Set" button.
**Responsive:** Filter bar becomes horizontally scrollable chip row on mobile; accordion remains single-column.

---

### 7.13 Career Roadmap Page

**Purpose:** Present personalized career guidance — skills, certifications, projects, and a learning path.
**Layout:** Three-column card grid (desktop): "Recommended Certifications," "Recommended Projects," "Skill Gaps to Close" — each a list card with checkable items (checkbox to mark as "in progress"/"done", purely client-side state). Below: a horizontal roadmap/timeline visual (stepper component) representing a high-level progression (e.g., "Now → 3 Months → 6 Months").
**Components:** List cards with checkboxes, horizontal stepper/timeline component, badges for skill priority (High/Medium/Low).
**Responsive:** Three columns → single column stacked; timeline switches from horizontal to vertical stepper on mobile.

---

### 7.14 Reports Page

**Purpose:** View and manage previously generated PDF reports.
**Layout:** Table/list view (similar to 6.9 Tables) — columns: Resume name, Date generated, Score snapshot (badge), Actions (Download, Delete icons).
**Empty State:** "No reports yet — generate one from any analysis page."
**Responsive:** Table converts to stacked cards on mobile (one card per report, action icons in a row at the bottom of each card).

---

### 7.15 Profile Page

**Purpose:** View/edit personal account information.
**Layout:** Single column, max-width 720px. Top: avatar (with upload/change overlay on hover) + name + email (read-only or editable inline). Below: form sections — "Personal Information" (name, email) and "Account" (member since, plan tier badge).
**Components:** Avatar uploader, text inputs, "Save Changes" primary button (sticky at bottom on mobile).
**Responsive:** Form fields full-width on all breakpoints; avatar shrinks slightly on mobile.

---

### 7.16 Settings Page

**Purpose:** Manage preferences and security.
**Layout:** Left-nav tabbed settings (desktop): "General," "Appearance," "Security," "Notifications" / on mobile this becomes a vertical accordion or simple stacked sections.
- **General:** language (future), default report format.
- **Appearance:** Dark/Light/System theme toggle (segmented control, 3 options).
- **Security:** Change password form, "Delete My Account" danger zone (red-bordered card with destructive button + confirmation modal).
- **Notifications:** Toggle switches for email notifications (e.g., "Analysis complete," "Weekly tips").
**Responsive:** Tab navigation collapses into a dropdown or accordion on mobile; content sections remain full-width stacked.

---

### 7.17 404 Page

**Purpose:** Friendly error page for unmatched routes.
**Layout:** Centered, vertically centered in viewport — large "404" (Display style, `text-muted`), H2 "Page not found," Body Small supporting text, primary "Back to Dashboard" button (or "Back to Home" if logged out).
**Responsive:** Same centered layout scales naturally; font sizes reduce slightly on mobile.

---

## 8. User Experience Guidelines

### 8.1 Loading Behaviour
- Skeletons for predictable, fast (<2s) loads (page navigation, table fetches).
- Dedicated AI Processing state (Section 6.13) for long-running AI calls (15–25s), always communicating progress via rotating status text rather than a static spinner, to reduce perceived wait time.

### 8.2 Empty States
- Every list/data view (Resume History, Reports, Career Roadmap, Interview Questions before generation) has a designed empty state — never a blank white page.

### 8.3 Error Handling
- Field-level errors: inline, immediate, red text below the field.
- Page-level errors (failed AI call, network error): Alert banner at top of content area with a "Retry" action.
- Catastrophic errors (page crash): fallback error boundary screen, similar styling to 404 page but with "Something went wrong" messaging + "Reload" button.

### 8.4 Animations & Micro-interactions
- Buttons: subtle scale (0.98) on press.
- Score reveals: count-up animation + ring fill animation on Analysis page load.
- Hover affordances on all interactive cards (shadow + slight lift).
- Toggle switches (theme, notifications): smooth 200ms slide with color transition.

### 8.5 Accessibility
- Minimum contrast ratio 4.5:1 for body text, 3:1 for large text, validated against both light and dark palettes.
- All interactive elements reachable via Tab, with visible focus rings (`shadow-focus` token).
- ARIA labels on icon-only buttons (e.g., `aria-label="Delete resume"`).
- Charts include a text-equivalent summary (e.g., visually-hidden table) for screen reader users.
- Modals trap focus and return focus to the triggering element on close.
- Color is never the sole indicator of meaning (score badges pair color with text/number, not color alone).

### 8.6 Keyboard Navigation
- Logical tab order following visual layout (sidebar → top nav → main content).
- Esc closes modals/drawers; Enter submits focused forms; Arrow keys navigate within accordion/tab groups.

---

## 9. Responsiveness Summary

| Breakpoint | Range | Sidebar | Grid Behavior | Charts |
|---|---|---|---|---|
| Desktop | ≥1280px | Full sidebar (240px), always visible | Multi-column (3–4 cols) | Side-by-side |
| Laptop | 1024–1279px | Full sidebar | Multi-column (2–3 cols) | Side-by-side, slightly compressed |
| Tablet | 768–1023px | Icon-only collapsed sidebar (expandable) | 2-column max | Stacked vertically |
| Mobile | <768px | Slide-in drawer (hidden by default) | Single column | Full-width stacked, horizontal scroll for tables |

---

## 10. Conclusion

This design specification establishes a consistent, restrained, data-forward visual language for the AI Resume Analyzer & Career Assistant — one that signals competence and trustworthiness (essential for a tool handling career-critical decisions) while remaining approachable for students and first-time job seekers. Every component, color token, and spacing rule defined here is intended to be directly translatable into a design-token-based implementation (e.g., Tailwind config), ensuring that any frontend developer or AI coding tool can build a pixel-consistent, accessible, and responsive product directly from this document.