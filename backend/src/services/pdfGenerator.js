'use strict';

/**
 * PDF Generator Service
 * Generates a professional multipage PDF document using pdfkit.
 *
 * Reference: UI-Guide.md, Implementation-Guide.md Phase 6C
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
const REPORTS_DIR = path.resolve(UPLOADS_DIR, 'reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Helper to group suggestions by priority
 *
 * @param {Array<string>} suggestions
 * @returns {object} { high: [], medium: [], low: [] }
 */
const groupRecommendations = (suggestions = []) => {
  const grouped = { high: [], medium: [], low: [] };
  suggestions.forEach((s) => {
    const lower = s.toLowerCase();
    if (
      lower.includes('high') ||
      lower.includes('critical') ||
      lower.includes('essential') ||
      lower.includes('must') ||
      lower.includes('urgent') ||
      lower.includes('important')
    ) {
      grouped.high.push(s);
    } else if (
      lower.includes('medium') ||
      lower.includes('should') ||
      lower.includes('consider') ||
      lower.includes('recommended')
    ) {
      grouped.medium.push(s);
    } else {
      grouped.low.push(s);
    }
  });

  // Safe fallback to distribute them if they couldn't be auto-classified
  if (grouped.high.length === 0 && grouped.medium.length === 0 && grouped.low.length === 0 && suggestions.length > 0) {
    const third = Math.ceil(suggestions.length / 3);
    grouped.high = suggestions.slice(0, third);
    grouped.medium = suggestions.slice(third, third * 2);
    grouped.low = suggestions.slice(third * 2);
  }

  // Ensure they aren't empty arrays if we want to display at least one item
  if (grouped.high.length === 0) grouped.high.push('Review formatting alignment throughout the document.');
  if (grouped.medium.length === 0) grouped.medium.push('Add quantitative impact metrics (e.g. % improved) to experience descriptions.');
  if (grouped.low.length === 0) grouped.low.push('Tailor summary keywords slightly for each job application.');

  return grouped;
};

/**
 * Generate PDF Report
 *
 * @param {object} params
 * @param {string} params.reportId - Generated report ID
 * @param {object} params.user - User model instance
 * @param {object} params.resume - Resume model instance
 * @param {object} params.analysis - Analysis model instance
 * @returns {Promise<string>} File path to the generated PDF
 */
const generatePDFReport = async ({ reportId, user, resume, analysis }) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `${reportId}.pdf`;
      const outputPath = path.join(REPORTS_DIR, fileName);
      const doc = new PDFDocument({ margin: 50, bufferPages: true });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // --- COVER PAGE ---
      // Primary color banner (Indigo #4F46E5)
      doc.rect(0, 0, doc.page.width, 25).fill('#4F46E5');

      doc.moveDown(4);
      doc.fillColor('#1A202C')
         .fontSize(32)
         .font('Helvetica-Bold')
         .text('AI RESUME ANALYSIS', { align: 'center' });
      
      doc.fontSize(20)
         .fillColor('#4F46E5')
         .text('PROFESSIONAL SCORECARD REPORT', { align: 'center' });

      doc.moveDown(3);
      doc.strokeColor('#E2E8F0')
         .lineWidth(1)
         .moveTo(100, doc.y)
         .lineTo(doc.page.width - 100, doc.y)
         .stroke();

      doc.moveDown(3);
      doc.fontSize(12)
         .fillColor('#4A5568')
         .font('Helvetica');

      const infoX = 150;
      doc.text('Prepared For:', infoX, doc.y, { continued: true })
         .font('Helvetica-Bold')
         .fillColor('#1A202C')
         .text(`  ${user.fullName}`);
      
      doc.moveDown(0.8);
      doc.font('Helvetica')
         .fillColor('#4A5568')
         .text('Resume File:', infoX, doc.y, { continued: true })
         .font('Helvetica-Bold')
         .fillColor('#1A202C')
         .text(`  ${resume.originalFileName || resume.fileName}`);

      doc.moveDown(0.8);
      doc.font('Helvetica')
         .fillColor('#4A5568')
         .text('Version Tag:', infoX, doc.y, { continued: true })
         .font('Helvetica-Bold')
         .fillColor('#1A202C')
         .text(`  Version ${resume.versionNumber} ${resume.versionLabel ? `(${resume.versionLabel})` : ''}`);

      doc.moveDown(0.8);
      doc.font('Helvetica')
         .fillColor('#4A5568')
         .text('Report ID:', infoX, doc.y, { continued: true })
         .font('Helvetica-Bold')
         .fillColor('#1A202C')
         .text(`  ${reportId}`);

      doc.moveDown(0.8);
      doc.font('Helvetica')
         .fillColor('#4A5568')
         .text('Generated Date:', infoX, doc.y, { continued: true })
         .font('Helvetica-Bold')
         .fillColor('#1A202C')
         .text(`  ${new Date(analysis.createdAt || Date.now()).toLocaleDateString('en-US', { dateStyle: 'long' })}`);

      doc.moveDown(6);
      doc.fontSize(10)
         .fillColor('#718096')
         .font('Helvetica-Oblique')
         .text('Confidential - Generated by AI Resume Analyzer System', { align: 'center' });

      // Add Page Break
      doc.addPage();

      // --- PAGE 2: EXECUTIVE OVERVIEW ---
      doc.fillColor('#1A202C')
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('Executive Summary', 50, 50);

      doc.strokeColor('#4F46E5')
         .lineWidth(2)
         .moveTo(50, 72)
         .lineTo(150, 72)
         .stroke();

      doc.moveDown(2);

      // Score Callout Boxes (Draw rectangles)
      const startY = doc.y;
      const boxWidth = 150;
      const boxHeight = 80;
      
      // Box 1: ATS Score
      doc.roundedRect(50, startY, boxWidth, boxHeight, 8)
         .fillOpacity(0.05)
         .fill('#4F46E5');
      doc.fillOpacity(1);
      doc.fontSize(10).fillColor('#718096').font('Helvetica-Bold').text('ATS SCORE', 65, startY + 15);
      doc.fontSize(24).fillColor('#4F46E5').font('Helvetica-Bold').text(`${analysis.atsScore}/100`, 65, startY + 35);

      // Box 2: Overall Rating
      doc.roundedRect(220, startY, boxWidth, boxHeight, 8)
         .fillOpacity(0.05)
         .fill('#10B981');
      doc.fillOpacity(1);
      doc.fontSize(10).fillColor('#718096').font('Helvetica-Bold').text('OVERALL RATING', 235, startY + 15);
      doc.fontSize(24).fillColor('#10B981').font('Helvetica-Bold').text(`${analysis.overallScore}/100`, 235, startY + 35);

      // Box 3: Health Status
      let healthColor = '#F59E0B'; // Amber
      let healthText = 'Good';
      if (analysis.overallScore >= 75) {
        healthColor = '#10B981'; // Green
        healthText = 'Excellent';
      } else if (analysis.overallScore < 50) {
        healthColor = '#EF4444'; // Red
        healthText = 'Needs Work';
      }

      doc.roundedRect(390, startY, boxWidth, boxHeight, 8)
         .fillOpacity(0.05)
         .fill(healthColor);
      doc.fillOpacity(1);
      doc.fontSize(10).fillColor('#718096').font('Helvetica-Bold').text('RESUME HEALTH', 405, startY + 15);
      doc.fontSize(20).fillColor(healthColor).font('Helvetica-Bold').text(healthText, 405, startY + 38);

      doc.y = startY + boxHeight + 30;

      // AI Summary
      doc.fillColor('#1A202C')
         .fontSize(13)
         .font('Helvetica-Bold')
         .text('AI Summary Analysis');
      doc.moveDown(0.5);
      doc.fontSize(10)
         .fillColor('#4A5568')
         .font('Helvetica')
         .text(analysis.summary || 'No summary available.', { align: 'justify', lineGap: 3 });

      // --- SECTION SCORES TABLE ---
      doc.moveDown(2);
      doc.fillColor('#1A202C')
         .fontSize(13)
         .font('Helvetica-Bold')
         .text('Section Scoring Breakdown');
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const colWidths = [180, 100, 100];
      
      // Header
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#718096');
      doc.text('SECTION', 60, tableTop);
      doc.text('SCORE', 260, tableTop);
      doc.text('RATING', 360, tableTop);

      doc.strokeColor('#E2E8F0')
         .lineWidth(1)
         .moveTo(50, tableTop + 15)
         .lineTo(500, tableTop + 15)
         .stroke();

      const sections = [
        { label: 'Grammar & Tone', val: analysis.grammarScore },
        { label: 'Formatting & Layout', val: analysis.formattingScore },
        { label: 'Technical & Soft Skills', val: analysis.skillsScore },
        { label: 'Project Experience', val: analysis.projectsScore },
        { label: 'Work History & Experience', val: analysis.experienceScore },
        { label: 'Education & Certifications', val: analysis.educationScore },
        { label: 'Professional Summary / Intro', val: analysis.summaryScore }
      ];

      let currentY = tableTop + 25;
      sections.forEach((sec) => {
        doc.fontSize(9.5).font('Helvetica').fillColor('#2D3748');
        doc.text(sec.label, 60, currentY);
        doc.font('Helvetica-Bold').text(`${sec.val}/100`, 260, currentY);
        
        let rating = 'Needs Work';
        let ratingColor = '#EF4444';
        if (sec.val >= 75) {
          rating = 'Strong';
          ratingColor = '#10B981';
        } else if (sec.val >= 50) {
          rating = 'Average';
          ratingColor = '#F59E0B';
        }
        doc.fillColor(ratingColor).text(rating, 360, currentY);

        doc.strokeColor('#EDF2F7')
           .moveTo(50, currentY + 15)
           .lineTo(500, currentY + 15)
           .stroke();

        currentY += 23;
      });

      // Add Page Break
      doc.addPage();

      // --- PAGE 3: STRENGTHS, WEAKNESSES, KEYWORDS ---
      doc.fillColor('#1A202C')
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('Detailed Analysis Insights', 50, 50);

      doc.strokeColor('#4F46E5')
         .lineWidth(2)
         .moveTo(50, 72)
         .lineTo(150, 72)
         .stroke();

      doc.moveDown(2);

      // Strengths
      doc.fillColor('#10B981')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Key Strengths');
      doc.moveDown(0.4);

      if (!analysis.strengths || analysis.strengths.length === 0) {
        doc.fontSize(9.5).fillColor('#4A5568').font('Helvetica').text('• No specific strengths highlighted.');
      } else {
        analysis.strengths.forEach((str) => {
          doc.fontSize(9.5).fillColor('#2D3748').font('Helvetica').text(`• ${str}`, { lineGap: 2 });
        });
      }

      doc.moveDown(1.5);

      // Weaknesses
      doc.fillColor('#EF4444')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Areas for Improvement (Weaknesses)');
      doc.moveDown(0.4);

      if (!analysis.weaknesses || analysis.weaknesses.length === 0) {
        doc.fontSize(9.5).fillColor('#4A5568').font('Helvetica').text('• No critical weaknesses identified.');
      } else {
        analysis.weaknesses.forEach((wk) => {
          doc.fontSize(9.5).fillColor('#2D3748').font('Helvetica').text(`• ${wk}`, { lineGap: 2 });
        });
      }

      doc.moveDown(2);

      // Keywords Distribution
      doc.fillColor('#4F46E5')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Keyword Optimization Analysis');
      doc.moveDown(0.6);

      const kwY = doc.y;
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#2D3748').text('Detected Keywords:', 50, kwY);
      doc.font('Helvetica').fillColor('#4A5568').text(
        analysis.detectedSkills && analysis.detectedSkills.length > 0
          ? analysis.detectedSkills.slice(0, 12).join(', ')
          : 'None detected',
        160,
        kwY,
        { width: 340 }
      );

      doc.moveDown(1.2);
      const kwY2 = doc.y;
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#2D3748').text('Missing Keywords:', 50, kwY2);
      doc.font('Helvetica').fillColor('#E53E3E').text(
        analysis.missingSkills && analysis.missingSkills.length > 0
          ? analysis.missingSkills.slice(0, 12).join(', ')
          : 'None identified as missing',
        160,
        kwY2,
        { width: 340 }
      );

      // Add Page Break
      doc.addPage();

      // --- PAGE 4: PRIORITY RECOMMENDATIONS ---
      doc.fillColor('#1A202C')
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('Action Plan & Recommendations', 50, 50);

      doc.strokeColor('#4F46E5')
         .lineWidth(2)
         .moveTo(50, 72)
         .lineTo(150, 72)
         .stroke();

      doc.moveDown(2);

      const recs = groupRecommendations(analysis.suggestions);

      // High Priority
      doc.fillColor('#E53E3E')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('CRITICAL / HIGH PRIORITY ACTIONS');
      doc.moveDown(0.4);
      recs.high.forEach((item) => {
        doc.fontSize(9.5).fillColor('#2D3748').font('Helvetica').text(`[ ]  ${item}`, { lineGap: 3 });
      });

      doc.moveDown(1.5);

      // Medium Priority
      doc.fillColor('#DD6B20')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('RECOMMENDED / MEDIUM PRIORITY ACTIONS');
      doc.moveDown(0.4);
      recs.medium.forEach((item) => {
        doc.fontSize(9.5).fillColor('#2D3748').font('Helvetica').text(`[ ]  ${item}`, { lineGap: 3 });
      });

      doc.moveDown(1.5);

      // Low Priority
      doc.fillColor('#4A5568')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('OPTIONAL / LOW PRIORITY ACTIONS');
      doc.moveDown(0.4);
      recs.low.forEach((item) => {
        doc.fontSize(9.5).fillColor('#2D3748').font('Helvetica').text(`[ ]  ${item}`, { lineGap: 3 });
      });

      // --- FOOTER AND PAGE NUMBER INSERTS ---
      // Loop back through all pages to apply footers dynamically (except first page)
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);

        // Header on later pages
        if (i > 0) {
          doc.fontSize(7.5)
             .fillColor('#A0AEC0')
             .font('Helvetica')
             .text(`AI Resume Analyzer - Report: ${reportId}`, 50, 20, { align: 'left' });

          doc.strokeColor('#EDF2F7')
             .lineWidth(0.5)
             .moveTo(50, 30)
             .lineTo(550, 30)
             .stroke();
        }

        // Footer on all pages
        doc.strokeColor('#EDF2F7')
           .lineWidth(0.5)
           .moveTo(50, doc.page.height - 45)
           .lineTo(550, doc.page.height - 45)
           .stroke();

        const modelStr = `Model: ${analysis.aiModel || 'gemini-2.5-flash'}  |  Prompt v1.0  |  Schema v1.0`;
        doc.fontSize(7.5)
           .fillColor('#A0AEC0')
           .font('Helvetica')
           .text(modelStr, 50, doc.page.height - 35, { align: 'left' });

        doc.text(`Page ${i + 1} of ${range.count}`, 500, doc.page.height - 35, { align: 'right' });
      }

      // Finish document writing
      doc.end();

      writeStream.on('finish', () => {
        resolve(outputPath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generatePDFReport,
};
