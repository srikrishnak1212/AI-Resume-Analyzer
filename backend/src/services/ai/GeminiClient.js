'use strict';

/**
 * Gemini Client Service
 * Implements the AiProvider interface to interact with Google Gemini AI.
 * Handles system prompts, model invocation, JSON mode output, and mock fallback for testing/local setups.
 *
 * Reference: Architecture.md §6.3, AI-Prompts.md §8, §18
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const AiProvider = require('./AiProvider');
const config = require('../../config/env');
const logger = require('../../utils/logger');
const AppError = require('../../utils/AppError');

class GeminiClient extends AiProvider {
  constructor() {
    super();
    this.apiKey = config.gemini.apiKey;
    this.modelName = config.gemini.model;
    this.fallbackModelName = config.gemini.fallbackModel;

    // Initialize SDK if key is valid and not a placeholder
    const isValidKey = this.apiKey && this.apiKey !== 'your-gemini-api-key-here';
    if (isValidKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    } else {
      logger.warn('[GeminiClient] API key is missing or placeholder. Running in mock-fallback-only mode.');
    }
  }

  /**
   * Helper to map Gemini SDK errors to application errors.
   */
  _handleGeminiError(err) {
    const msg = err.message ? err.message.toLowerCase() : '';
    const status = err.status || err.statusCode || 500;

    // Check for invalid API key
    if (
      msg.includes('api_key_invalid') ||
      msg.includes('api key') ||
      msg.includes('key is invalid') ||
      (status === 400 && msg.includes('key')) ||
      status === 401 ||
      status === 403
    ) {
      return new AppError('Invalid Google Gemini API Key configured.', 401, 'AI_INVALID_API_KEY');
    }
    // Check for quota exceeded / rate limit
    if (msg.includes('quota') || msg.includes('limit') || msg.includes('429') || status === 429) {
      return new AppError('Gemini API rate limit or quota exceeded. Please try again later.', 429, 'AI_QUOTA_EXCEEDED');
    }
    // Check for model unavailable
    if (msg.includes('not found') || msg.includes('not supported') || msg.includes('404') || status === 404) {
      return new AppError('The requested Gemini model is currently unavailable or unsupported.', 503, 'AI_MODEL_UNAVAILABLE');
    }
    // Check for safety block
    if (msg.includes('safety') || msg.includes('block') || msg.includes('candidate')) {
      return new AppError('Gemini API blocked the response due to content safety filters.', 400, 'AI_SAFETY_BLOCKED');
    }
    // Check for timeout
    if (msg.includes('timeout') || msg.includes('deadline') || status === 504) {
      return new AppError('Gemini API request timed out.', 504, 'AI_TIMEOUT');
    }
    // Check for network failure
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('connect')) {
      return new AppError('Failed to communicate with Google Gemini API due to a network error.', 502, 'AI_NETWORK_FAILURE');
    }
    // Check for empty/invalid response
    if (msg.includes('empty') || msg.includes('no response')) {
      return new AppError('Received empty response from Gemini API.', 502, 'AI_EMPTY_RESPONSE');
    }

    return new AppError(`Gemini API error: ${err.message}`, status, 'AI_GENERIC_ERROR');
  }

  /**
   * Invokes Gemini model with system instruction and user prompt.
   */
  async analyzeResume(resumeText, parsedSections, options = {}) {
    const { systemPrompt, userPrompt, useFallbackModel = false } = options;

    const isTest = process.env.NODE_ENV === 'test' || config.env === 'test';
    const isMock = isTest || options.mock;

    if (isMock) {
      logger.info('[GeminiClient] Serving mock analysis results.');
      return this._generateMockAnalysis(resumeText, options.targetRole);
    }

    if (!this.genAI) {
      throw new AppError('Google Gemini API Key is missing. Please configure GEMINI_API_KEY in your env file.', 500, 'AI_CONFIG_ERROR');
    }

    try {
      const activeModel = useFallbackModel ? this.fallbackModelName : this.modelName;
      logger.info(`[GeminiClient] Calling Gemini API using model: ${activeModel}...`);

      const model = this.genAI.getGenerativeModel({
        model: activeModel,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1, // low temperature for determinism in scoring (AI-Prompts.md §1.1)
        },
        systemInstruction: systemPrompt,
      });

      const startTime = Date.now();
      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const text = response.text();
      const duration = Date.now() - startTime;

      logger.info(`[GeminiClient] Gemini API responded in ${duration}ms.`);
      return text;
    } catch (err) {
      logger.error(`[GeminiClient] Gemini API invocation failed: ${err.message}`);
      throw this._handleGeminiError(err);
    }
  }

  /**
   * Returns a static, highly realistic analysis structure conforming to the output schema.
   */
  _generateMockAnalysis(resumeText, targetRole = 'Software Engineer') {
    const mock = {
      overallScore: 82,
      atsScore: 78,
      grammarScore: 90,
      formattingScore: 85,
      skillsScore: 80,
      experienceScore: 75,
      summaryScore: 85,
      educationScore: 95,
      projectsScore: 80,
      scoreSummary: `The uploaded resume demonstrates a strong academic background and solid technical proficiency in software development, particularly matching the target role of ${targetRole}. The layout is clear and structured, though experience quantification could be improved.`,
      strengths: [
        'Excellent representation of technical skills including frontend/backend technologies',
        'Strong academic qualifications with clear mentions of coursework and GPA',
        'Good section separation and header structures'
      ],
      weaknesses: [
        'Lack of quantified results and business impact metrics in project points',
        'Professional summary is slightly brief and could target role competencies better',
        'Missing standard ATS keywords related to database performance and CI/CD pipelines'
      ],
      quickWins: [
        'Quantify work/project achievements by adding percentage/metric stats',
        'Expand professional summary to highlight system engineering experience',
        'Integrate missing keywords such as Docker, CI/CD, and REST API in experience descriptions'
      ],
      atsAnalysis: {
        passedChecks: [
          'Standard fonts used (Arial, Calibri)',
          'Clear chronological order of experience',
          'Standard contact info present'
        ],
        failedChecks: [
          'Missing key technologies in bullet descriptions',
          'Action verbs could be stronger at the start of bullets'
        ],
        keywordsFound: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python', 'Git'],
        keywordsMissing: ['REST API', 'Docker', 'CI/CD', 'TypeScript', 'Unit Testing'],
        formatWarnings: [
          'Visual divider lines may cause parsing breaks in older ATS engines'
        ]
      },
      grammarAnalysis: {
        issues: [
          {
            section: 'Experience',
            issue: 'Mixed tense usage in bullet points — past and present verbs combined'
          }
        ],
        suggestions: [
          'Ensure all past experiences use active past-tense verbs exclusively'
        ],
        toneAssessment: 'Professional, technical, and objective.'
      },
      formattingAnalysis: {
        issues: [
          'Right-aligned dates might overlap on some parser outputs'
        ],
        suggestions: [
          'Place dates in line with headings'
        ],
        lengthAssessment: 'Appropriate. The single-page layout is optimal for this experience level.'
      },
      sectionReviews: {
        summary: {
          feedback: 'Summary is professional but generic. Tailor it to highlight unique strengths.',
          score: 85
        },
        experience: {
          feedback: 'Include more bullet points describing specific contributions and technical accomplishments.',
          score: 75
        },
        education: {
          feedback: 'Excellent breakdown. Degrees and graduation years are clearly visible.',
          score: 95
        },
        skills: {
          feedback: 'Nicely grouped and relevant technical skills list.',
          score: 80
        },
        projects: {
          feedback: 'Projects show good technical application. Add quantitative metrics to prove business value.',
          score: 80
        }
      },
      skillsAnalysis: {
        detectedSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python', 'Git', 'SQL', 'HTML', 'CSS'],
        hardSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python', 'SQL'],
        softSkills: ['Problem Solving', 'Teamwork', 'Communication'],
        missingSkills: ['TypeScript', 'Docker', 'CI/CD', 'AWS', 'Jest'],
        trendingSkills: ['TypeScript', 'Next.js', 'AWS', 'Docker']
      }
    };

    return JSON.stringify(mock);
  }

  async matchJobDescription(resumeText, jobDescriptionText, options = {}) {
    const { systemPrompt, userPrompt, useFallbackModel = false } = options;

    const isTest = process.env.NODE_ENV === 'test' || config.env === 'test';
    const isMock = isTest || options.mock;

    if (isMock) {
      logger.info('[GeminiClient] Serving mock job match results.');
      return this._generateMockJobMatch(options.resumeId, options.jobDescriptionId);
    }

    if (!this.genAI) {
      throw new AppError('Google Gemini API Key is missing. Please configure GEMINI_API_KEY in your env file.', 500, 'AI_CONFIG_ERROR');
    }

    try {
      const activeModel = useFallbackModel ? this.fallbackModelName : this.modelName;
      logger.info(`[GeminiClient] Calling Gemini API for matching using model: ${activeModel}...`);

      const model = this.genAI.getGenerativeModel({
        model: activeModel,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
        systemInstruction: systemPrompt,
      });

      const startTime = Date.now();
      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const text = response.text();
      const duration = Date.now() - startTime;

      logger.info(`[GeminiClient] Gemini API job match responded in ${duration}ms.`);
      return text;
    } catch (err) {
      logger.error(`[GeminiClient] Gemini API job match failed: ${err.message}`);
      throw this._handleGeminiError(err);
    }
  }

  async extractJobDescriptionDetails(jobDescriptionText, options = {}) {
    const { systemPrompt, userPrompt, useFallbackModel = false } = options;

    const isTest = process.env.NODE_ENV === 'test' || config.env === 'test';
    const isMock = isTest || options.mock;

    if (isMock) {
      logger.info('[GeminiClient] Serving mock job description details.');
      return this._generateMockJobDescriptionDetails();
    }

    if (!this.genAI) {
      throw new AppError('Google Gemini API Key is missing. Please configure GEMINI_API_KEY in your env file.', 500, 'AI_CONFIG_ERROR');
    }

    try {
      const activeModel = useFallbackModel ? this.fallbackModelName : this.modelName;
      logger.info(`[GeminiClient] Calling Gemini API for extraction using model: ${activeModel}...`);

      const model = this.genAI.getGenerativeModel({
        model: activeModel,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
        systemInstruction: systemPrompt,
      });

      const startTime = Date.now();
      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const text = response.text();
      const duration = Date.now() - startTime;

      logger.info(`[GeminiClient] Gemini API extraction responded in ${duration}ms.`);
      return text;
    } catch (err) {
      logger.error(`[GeminiClient] Gemini API extraction failed: ${err.message}`);
      throw this._handleGeminiError(err);
    }
  }

  _generateMockJobMatch(resumeId, jobDescriptionId) {
    const mock = {
      overallMatchScore: 78,
      technicalSkillsScore: 82,
      softSkillsScore: 75,
      experienceScore: 70,
      educationScore: 90,
      projectsScore: 80,
      keywordScore: 75,
      matchedSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
      missingSkills: ['TypeScript', 'Docker', 'CI/CD'],
      matchedKeywords: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      missingKeywords: ['REST APIs', 'TypeScript', 'Docker', 'Agile'],
      strengths: [
        'Candidate has strong foundational experience in core tech stack (React, Node.js)',
        'Excellent academic credentials match the requirement'
      ],
      weaknesses: [
        'No direct experience with containerization (Docker) listed in the resume',
        'Lack of professional work experience'
      ],
      recommendations: [
        'Learn TypeScript and build a small project with it',
        'Deploy a project using Docker to demonstrate containerization skills'
      ],
      resumeImprovements: [
        'Add a separate section or bullet point highlighting REST API integration experience',
        'Update project descriptions to include database design details'
      ],
      priorityActions: [
        'Add REST API skills explicitly',
        'Add containerization keyword'
      ],
      summary: 'Overall, the candidate is a strong fit for the technical stack but lacks required tools like Docker and TypeScript.',
      confidenceScore: 85
    };
    return JSON.stringify(mock);
  }

  _generateMockJobDescriptionDetails() {
    const mock = {
      jobTitle: 'Software Engineer',
      companyName: 'Flipkart',
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'SQL'],
      preferredSkills: ['TypeScript', 'Docker', 'AWS', 'Jest'],
      experience: '0-2 years in Software Development',
      education: 'Bachelor\'s in Computer Science or related field',
      responsibilities: [
        'Design and develop high-performance web applications using React and Node.js',
        'Collaborate with product managers and other engineers to deliver new features',
        'Optimize applications for maximum speed and scalability'
      ],
      keywords: ['REST APIs', 'Agile', 'Unit Testing', 'GitHub', 'CI/CD']
    };
    return JSON.stringify(mock);
  }

  async rewriteResumeContent(originalContent, options = {}) {
    const { systemPrompt, userPrompt, useFallbackModel = false } = options;

    const isTest = process.env.NODE_ENV === 'test' || config.env === 'test';
    const isMock = isTest || options.mock;

    if (isMock) {
      logger.info('[GeminiClient] Serving mock resume rewrite.');
      return this._generateMockRewrite(originalContent, options.rewriteMode);
    }

    if (!this.genAI) {
      throw new AppError('Google Gemini API Key is missing. Please configure GEMINI_API_KEY in your env file.', 500, 'AI_CONFIG_ERROR');
    }

    try {
      const activeModel = useFallbackModel ? this.fallbackModelName : this.modelName;
      logger.info(`[GeminiClient] Calling Gemini API for rewrite using model: ${activeModel}...`);

      const model = this.genAI.getGenerativeModel({
        model: activeModel,
        generationConfig: {
          temperature: 0.3,
        },
        systemInstruction: systemPrompt,
      });

      const startTime = Date.now();
      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const text = response.text();
      const duration = Date.now() - startTime;

      logger.info(`[GeminiClient] Gemini API rewrite responded in ${duration}ms.`);
      return text;
    } catch (err) {
      logger.error(`[GeminiClient] Gemini API rewrite failed: ${err.message}`);
      throw this._handleGeminiError(err);
    }
  }

  async generateCoverLetter(resumeText, jobDescriptionText, options = {}) {
    const { systemPrompt, userPrompt, useFallbackModel = false } = options;

    const isTest = process.env.NODE_ENV === 'test' || config.env === 'test';
    const isMock = isTest || options.mock;

    if (isMock) {
      logger.info('[GeminiClient] Serving mock cover letter.');
      return this._generateMockCoverLetter(options.jobTitle, options.companyName, options.tone, options.hiringManager);
    }

    if (!this.genAI) {
      throw new AppError('Google Gemini API Key is missing. Please configure GEMINI_API_KEY in your env file.', 500, 'AI_CONFIG_ERROR');
    }

    try {
      const activeModel = useFallbackModel ? this.fallbackModelName : this.modelName;
      logger.info(`[GeminiClient] Calling Gemini API for cover letter using model: ${activeModel}...`);

      const model = this.genAI.getGenerativeModel({
        model: activeModel,
        generationConfig: {
          temperature: 0.5,
        },
        systemInstruction: systemPrompt,
      });

      const startTime = Date.now();
      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const text = response.text();
      const duration = Date.now() - startTime;

      logger.info(`[GeminiClient] Gemini API cover letter responded in ${duration}ms.`);
      return text;
    } catch (err) {
      logger.error(`[GeminiClient] Gemini API cover letter failed: ${err.message}`);
      throw this._handleGeminiError(err);
    }
  }

  _generateMockRewrite(original, mode = 'Professional') {
    return `[Rewritten - Mode: ${mode}]\nOptimized and polished copy of the original text. Highlights metrics, action verbs, and improves clarity: ${original}`;
  }

  _generateMockCoverLetter(jobTitle = 'Software Engineer', company = 'Flipkart', tone = 'Professional', hiringManager = '') {
    const salutation = hiringManager ? `Dear ${hiringManager},` : 'Dear Hiring Team,';
    return `${salutation}\n\nI am writing to express my strong interest in the ${jobTitle} position at ${company}. With my background in software development and technical expertise, I am confident in my ability to contribute value to your engineering team.\n\nThank you for your time and consideration.\n\nSincerely,\nCandidate (Tone: ${tone})`;
  }

  // CENTRALIZED PLACEHOLDERS FOR FUTURE PHASES
  async generateInterviewPrep(resumeText, jobDescriptionText, options = {}) {
    const { systemPrompt, userPrompt, useFallbackModel = false } = options;

    const isTest = process.env.NODE_ENV === 'test' || config.env === 'test';
    if (isTest) {
      return JSON.stringify({ questions: ['Mock interview question?'] });
    }

    if (!this.genAI) {
      throw new AppError('Google Gemini API Key is missing. Please configure GEMINI_API_KEY in your env file.', 500, 'AI_CONFIG_ERROR');
    }

    try {
      const activeModel = useFallbackModel ? this.fallbackModelName : this.modelName;
      logger.info(`[GeminiClient] Calling Gemini API for interview prep using model: ${activeModel}...`);

      const model = this.genAI.getGenerativeModel({
        model: activeModel,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      logger.error(`[GeminiClient] Gemini API interview prep failed: ${err.message}`);
      throw this._handleGeminiError(err);
    }
  }

  async generateCareerRoadmap(resumeText, options = {}) {
    const { systemPrompt, userPrompt, useFallbackModel = false } = options;

    const isTest = process.env.NODE_ENV === 'test' || config.env === 'test';
    if (isTest) {
      return JSON.stringify({ steps: ['Mock career step'] });
    }

    if (!this.genAI) {
      throw new AppError('Google Gemini API Key is missing. Please configure GEMINI_API_KEY in your env file.', 500, 'AI_CONFIG_ERROR');
    }

    try {
      const activeModel = useFallbackModel ? this.fallbackModelName : this.modelName;
      logger.info(`[GeminiClient] Calling Gemini API for career roadmap using model: ${activeModel}...`);

      const model = this.genAI.getGenerativeModel({
        model: activeModel,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      logger.error(`[GeminiClient] Gemini API career roadmap failed: ${err.message}`);
      throw this._handleGeminiError(err);
    }
  }
}

module.exports = new GeminiClient();
