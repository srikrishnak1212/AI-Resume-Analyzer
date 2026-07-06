import React from 'react';
import { SCORE_THRESHOLDS } from '../../utils/constants';

/**
 * MatchScoreCard — Displays sub-scores (Technical Skills, Soft Skills, Experience, Education, Projects, Keywords).
 */
const MatchScoreCard = ({ scores = {} }) => {
  const scoreItems = [
    { label: 'Technical Skills', val: scores.technicalSkillsScore || 0 },
    { label: 'Soft Skills', val: scores.softSkillsScore || 0 },
    { label: 'Experience Match', val: scores.experienceScore || 0 },
    { label: 'Education Match', val: scores.educationScore || 0 },
    { label: 'Projects Alignment', val: scores.projectsScore || 0 },
    { label: 'Keywords Density', val: scores.keywordScore || 0 },
  ];

  const getProgressColor = (score) => {
    if (score <= SCORE_THRESHOLDS.DANGER_MAX) return 'bg-danger';
    if (score <= SCORE_THRESHOLDS.WARNING_MAX) return 'bg-warning';
    return 'bg-success';
  };

  const getTextColor = (score) => {
    if (score <= SCORE_THRESHOLDS.DANGER_MAX) return 'text-danger';
    if (score <= SCORE_THRESHOLDS.WARNING_MAX) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {scoreItems.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-border bg-surface p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-body-sm font-bold text-text-secondary">{item.label}</span>
            <span className={`text-h3 font-black ${getTextColor(item.val)}`}>
              {item.val}%
            </span>
          </div>

          <div className="w-full bg-border rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(item.val)}`}
              style={{ width: `${item.val}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchScoreCard;
