'use strict';

/**
 * Section Extractor — heuristic-based resume section segmentation.
 * Produces the `sections` sub-document stored on the Resume model.
 *
 * Approach: keyword-boundary detection on raw text lines.
 * This is a best-effort MVP extractor; Phase 4 AI parsing will supersede it.
 *
 * Reference: Database.md §3.2 (sections schema), Implementation-Guide.md Phase 3
 * Rule: Never duplicate code, async/await (PROJECT_RULES.md)
 */

const logger = require('../../utils/logger');

// ─── Section heading keywords (lowercase) ─────────────────────────────────────
const SECTION_PATTERNS = {
  summary:        /^(summary|objective|profile|about|professional summary|career objective)/i,
  experience:     /^(experience|work experience|employment|professional experience|work history|internship)/i,
  education:      /^(education|academic|qualification|degree)/i,
  skills:         /^(skills|technical skills|core competencies|technologies|tools|expertise)/i,
  projects:       /^(projects|personal projects|academic projects|key projects|side projects)/i,
  certifications: /^(certifications?|certificates?|licen[sc]e|credentials)/i,
  achievements:   /^(achievements?|awards?|honors?|accomplishments?|recognition)/i,
};

// ─── Contact info extraction ──────────────────────────────────────────────────

const EMAIL_RE   = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
const PHONE_RE   = /(\+?\d[\d\s\-().]{7,}\d)/;
const LINKEDIN_RE = /(linkedin\.com\/in\/[\w-]+)/i;
const GITHUB_RE  = /(github\.com\/[\w-]+)/i;
const URL_RE     = /https?:\/\/[\w\-./]+/i;

const extractContactInfo = (lines) => {
  const block = lines.slice(0, 15).join(' ');
  return {
    name:     lines[0]?.trim() || null,
    email:    (block.match(EMAIL_RE)    || [])[0] || null,
    phone:    (block.match(PHONE_RE)    || [])[1] || null,
    linkedin: (block.match(LINKEDIN_RE) || [])[1] || null,
    github:   (block.match(GITHUB_RE)   || [])[1] || null,
    website:  (block.match(URL_RE)      || [])[0] || null,
    location: null, // hard to extract reliably without ML
  };
};

// ─── Main extractor ───────────────────────────────────────────────────────────

/**
 * Extract structured sections from raw resume text.
 *
 * @param {string} rawText — full text extracted from PDF/DOCX
 * @returns {object} sections — matches Database.md §3.2 sectionsSchema
 */
const extractSections = (rawText) => {
  const sections = {
    contactInfo:    null,
    summary:        null,
    experience:     [],
    education:      [],
    skills:         [],
    projects:       [],
    certifications: [],
    achievements:   [],
  };

  if (!rawText || typeof rawText !== 'string') {
    return sections;
  }

  try {
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return sections;

    // Extract contact info from the top block
    sections.contactInfo = extractContactInfo(lines);

    // ── Segment the rest into named sections ──────────────────────────────────
    let currentSection = null;
    const sectionBuckets = {
      summary: [],
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      achievements: [],
    };

    for (const line of lines) {
      // Check if this line is a section heading
      let matched = false;
      for (const [sectionName, pattern] of Object.entries(SECTION_PATTERNS)) {
        if (pattern.test(line)) {
          currentSection = sectionName;
          matched = true;
          break;
        }
      }

      if (!matched && currentSection && sectionBuckets[currentSection] !== undefined) {
        sectionBuckets[currentSection].push(line);
      }
    }

    // ── Map buckets to schema fields ──────────────────────────────────────────
    if (sectionBuckets.summary.length > 0) {
      sections.summary = sectionBuckets.summary.join(' ');
    }

    if (sectionBuckets.skills.length > 0) {
      // Split comma/pipe/bullet-separated skill lists
      const raw = sectionBuckets.skills.join(', ');
      sections.skills = raw
        .split(/[,|•·\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length < 60);
    }

    if (sectionBuckets.certifications.length > 0) {
      sections.certifications = sectionBuckets.certifications.filter((l) => l.length > 3);
    }

    if (sectionBuckets.achievements.length > 0) {
      sections.achievements = sectionBuckets.achievements.filter((l) => l.length > 3);
    }

    // Experience, education, projects stored as raw line arrays (AI Phase 4 will enrich these)
    if (sectionBuckets.experience.length > 0) {
      sections.experience = sectionBuckets.experience.map((l) => ({ raw: l }));
    }
    if (sectionBuckets.education.length > 0) {
      sections.education = sectionBuckets.education.map((l) => ({ raw: l }));
    }
    if (sectionBuckets.projects.length > 0) {
      sections.projects = sectionBuckets.projects.map((l) => ({ raw: l }));
    }
  } catch (err) {
    logger.error(`[sectionExtractor] Extraction error: ${err.message}`);
  }

  return sections;
};

/**
 * Count words in raw text.
 * @param {string} text
 * @returns {number}
 */
const countWords = (text) => {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
};

module.exports = { extractSections, countWords };
