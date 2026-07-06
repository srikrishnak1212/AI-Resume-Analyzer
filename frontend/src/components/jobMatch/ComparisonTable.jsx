import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

/**
 * ComparisonTable — Paired grid comparing resume details to job requirements.
 */
const ComparisonTable = ({ resume = {}, jd = {}, match = {} }) => {
  // Extract details
  const resumeSkills = resume.sections?.skills || [];
  const jdRequiredSkills = jd.extractedDetails?.requiredSkills || [];
  const jdPreferredSkills = jd.extractedDetails?.preferredSkills || [];
  
  const resumeEdu = resume.sections?.education?.[0]
    ? `${resume.sections.education[0].degree || ''} (${resume.sections.education[0].institution || ''})`
    : 'None listed';
  const jdEdu = jd.extractedDetails?.education || 'Degree not specified';

  const resumeExp = resume.sections?.experience?.[0]
    ? `${resume.sections.experience[0].title || ''} at ${resume.sections.experience[0].company || ''}`
    : 'None listed';
  const jdExp = jd.extractedDetails?.experience || 'Experience not specified';

  const rows = [
    {
      criteria: 'Required Skills',
      resume: resumeSkills.slice(0, 8).join(', ') || 'No skills listed',
      job: jdRequiredSkills.slice(0, 8).join(', ') || 'Not specified',
      status: match.overallScore >= 75 ? 'match' : 'partial',
    },
    {
      criteria: 'Preferred Skills',
      resume: resumeSkills.filter(s => !jdRequiredSkills.includes(s)).slice(0, 6).join(', ') || 'None matching',
      job: jdPreferredSkills.slice(0, 6).join(', ') || 'Not specified',
      status: match.technicalSkillsScore >= 80 ? 'match' : 'partial',
    },
    {
      criteria: 'Target Experience',
      resume: resumeExp,
      job: jdExp,
      status: match.experienceScore >= 75 ? 'match' : 'partial',
    },
    {
      criteria: 'Target Education',
      resume: resumeEdu,
      job: jdEdu,
      status: match.educationScore >= 75 ? 'match' : 'partial',
    },
  ];

  const getStatusIcon = (status) => {
    if (status === 'match') return <Check className="h-5 w-5 text-success" />;
    if (status === 'partial') return <AlertCircle className="h-5 w-5 text-warning" />;
    return <X className="h-5 w-5 text-danger" />;
  };

  const getStatusLabel = (status) => {
    if (status === 'match') return 'Strong Fit';
    if (status === 'partial') return 'Partial Gap';
    return 'Missing';
  };

  const getStatusBadgeColor = (status) => {
    if (status === 'match') return 'bg-success-light text-success dark:bg-success/20';
    if (status === 'partial') return 'bg-warning-light text-warning dark:bg-warning/20';
    return 'bg-danger-light text-danger dark:bg-danger/20';
  };

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-alt border-b border-border text-caption font-bold text-text-secondary uppercase tracking-wider">
              <th className="px-6 py-4">Evaluation Criteria</th>
              <th className="px-6 py-4">Your Resume</th>
              <th className="px-6 py-4">Job Description</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-surface-alt/20 transition-colors duration-150">
                <td className="px-6 py-4.5 text-body-sm font-bold text-text-primary">
                  {row.criteria}
                </td>
                <td className="px-6 py-4.5 text-body-sm text-text-secondary max-w-[240px] truncate">
                  {row.resume}
                </td>
                <td className="px-6 py-4.5 text-body-sm text-text-secondary max-w-[240px] truncate">
                  {row.job}
                </td>
                <td className="px-6 py-4.5 text-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-caption font-bold ${getStatusBadgeColor(row.status)}`}>
                    {getStatusIcon(row.status)}
                    <span>{getStatusLabel(row.status)}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
