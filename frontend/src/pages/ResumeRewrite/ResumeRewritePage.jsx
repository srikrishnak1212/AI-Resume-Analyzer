import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/common/AppLayout';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { listResumes } from '../../services/resumeService';
import { triggerRewrite, listRewrites, deleteRewrite } from '../../services/rewriteService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RefreshCw, Edit3, Trash2, Calendar, FileText, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

const SECTIONS = [
  'Professional Summary',
  'Experience',
  'Projects',
  'Skills',
  'Education',
  'Achievements',
  'Certifications',
  'Entire Resume',
];

const MODES = [
  'Professional',
  'ATS Optimized',
  'Concise',
  'Detailed',
  'Executive',
  'Entry Level',
  'Technical',
  'Recruiter Friendly',
];

const IMPROVEMENTS = [
  { id: 'Grammar', label: 'Grammar & Syntax' },
  { id: 'Professional Tone', label: 'Tone Polish' },
  { id: 'Readability', label: 'Readability & Flow' },
  { id: 'Action Verbs', label: 'Action Verbs' },
  { id: 'Impact Statements', label: 'Impact Statements' },
  { id: 'Keyword Density', label: 'Keyword Density' },
  { id: 'ATS Compatibility', label: 'ATS Compatibility' },
  { id: 'Achievement Quantification', label: 'Quantified Metrics' },
];

const ResumeRewritePage = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  
  const [sectionName, setSectionName] = useState('Professional Summary');
  const [rewriteMode, setRewriteMode] = useState('Professional');
  const [originalContent, setOriginalContent] = useState('');
  const [selectedImprovements, setSelectedImprovements] = useState(['Grammar', 'Professional Tone']);

  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [rewriteHistory, setRewriteHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [resumesData, historyData] = await Promise.all([
        listResumes({ page: 1, limit: 50 }),
        listRewrites({ page: 1, limit: 10 }),
      ]);

      const completed = (resumesData.resumes || []).filter(r => r.parsingStatus === 'Completed');
      setResumes(completed);
      
      if (completed.length > 0) {
        const firstResume = completed[0];
        setSelectedResumeId(firstResume._id);
        extractSectionContent(firstResume, 'Professional Summary');
      }

      setRewriteHistory(historyData.rewrites || []);
      setTotalPages(historyData.pagination?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load rewrite setup details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const extractSectionContent = (resume, section) => {
    if (!resume) return;
    const sect = resume.sections || {};
    
    if (section === 'Professional Summary') {
      setOriginalContent(sect.summary || '');
    } else if (section === 'Experience') {
      setOriginalContent(
        typeof sect.experience === 'string'
          ? sect.experience
          : sect.experience?.map((e) => `${e.title || 'Role'} at ${e.company || 'Company'}\n${e.description || ''}`).join('\n\n') || ''
      );
    } else if (section === 'Projects') {
      setOriginalContent(
        typeof sect.projects === 'string'
          ? sect.projects
          : sect.projects?.map((p) => `${p.title || 'Project'}\n${p.description || ''}`).join('\n\n') || ''
      );
    } else if (section === 'Skills') {
      setOriginalContent(sect.skills?.join(', ') || '');
    } else if (section === 'Education') {
      setOriginalContent(
        typeof sect.education === 'string'
          ? sect.education
          : sect.education?.map((ed) => `${ed.degree || 'Degree'} at ${ed.institution || 'School'}`).join('\n') || ''
      );
    } else if (section === 'Achievements') {
      setOriginalContent(sect.achievements?.join('\n') || '');
    } else if (section === 'Certifications') {
      setOriginalContent(sect.certifications?.join('\n') || '');
    } else if (section === 'Entire Resume') {
      setOriginalContent(resume.parsedText || '');
    }
  };

  const handleResumeChange = (resumeId) => {
    setSelectedResumeId(resumeId);
    const selected = resumes.find(r => r._id === resumeId);
    extractSectionContent(selected, sectionName);
  };

  const handleSectionChange = (section) => {
    setSectionName(section);
    const selected = resumes.find(r => r._id === selectedResumeId);
    extractSectionContent(selected, section);
  };

  const handleToggleImprovement = (impId) => {
    setSelectedImprovements(prev =>
      prev.includes(impId) ? prev.filter(x => x !== impId) : [...prev, impId]
    );
  };

  const handleTriggerRewrite = async () => {
    if (!selectedResumeId) {
      toast.error('Please upload or select a resume first.');
      return;
    }
    if (originalContent.trim().length < 10) {
      toast.error('Section content is too short to rewrite.');
      return;
    }

    try {
      setRewriting(true);
      toast('Rewriting resume content...');
      const result = await triggerRewrite({
        resumeId: selectedResumeId,
        sectionName,
        rewriteMode,
        originalContent: originalContent.trim(),
        improvements: selectedImprovements,
      });

      toast.success('Rewrite complete!');
      navigate(`/resume-rewrite/compare/${result.rewriteId}`);
    } catch (err) {
      toast.error('AI rewrite failed. Please check parameters.');
    } finally {
      setRewriting(false);
    }
  };

  const handleDeleteHistory = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this rewrite history item?')) return;

    try {
      await deleteRewrite(id);
      toast.success('History item removed.');
      const reload = await listRewrites({ page: historyPage, limit: 10 });
      setRewriteHistory(reload.rewrites || []);
    } catch (err) {
      toast.error('Failed to delete history.');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <LoadingSkeleton className="h-12 w-1/3 rounded-xl" />
          <LoadingSkeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary shadow-xs">
            <Edit3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-h1 font-black text-text-primary">AI Resume Rewrite</h1>
            <p className="text-body-sm text-text-muted mt-0.5">
              Select any section to polish, optimize keyword density, and rewrite using customized mode filters.
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings block */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
              {/* 1. Resume & Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-body-sm font-bold text-text-secondary">
                    Select Resume
                  </label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => handleResumeChange(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-body-sm text-text-primary focus:border-primary focus:outline-none"
                  >
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.fileName} (v{r.versionNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-body-sm font-bold text-text-secondary">
                    Select Section to Rewrite
                  </label>
                  <select
                    value={sectionName}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-body-sm text-text-primary focus:border-primary focus:outline-none"
                  >
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Text Content input */}
              <div className="flex flex-col gap-2">
                <label className="text-body-sm font-bold text-text-secondary">
                  Section Content
                </label>
                <textarea
                  rows={8}
                  value={originalContent}
                  onChange={(e) => setOriginalContent(e.target.value)}
                  placeholder="Paste or edit the original section details here..."
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-body-sm text-text-primary focus:border-primary focus:outline-none transition-colors duration-150 resize-y"
                />
              </div>

              <hr className="border-border" />

              {/* 3. Rewrite Modes & Improvement Tags */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-body-sm font-bold text-text-secondary">
                    AI Rewrite Mode
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {MODES.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setRewriteMode(mode)}
                        className={`rounded-xl px-4 py-3 text-caption font-bold border transition-all text-center outline-none ${
                          rewriteMode === mode
                            ? 'border-primary bg-primary-light/40 text-primary dark:bg-primary-light/15'
                            : 'border-border bg-surface text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-body-sm font-bold text-text-secondary">
                    Improvements to Focus On
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {IMPROVEMENTS.map((imp) => {
                      const active = selectedImprovements.includes(imp.id);
                      return (
                        <button
                          key={imp.id}
                          type="button"
                          onClick={() => handleToggleImprovement(imp.id)}
                          className={`rounded-lg px-3 py-1.5 text-caption font-bold border transition-all outline-none ${
                            active
                              ? 'border-primary bg-primary-light/20 text-primary dark:bg-primary-light/10'
                              : 'border-border bg-surface text-text-muted hover:text-text-primary'
                          }`}
                        >
                          {imp.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  onClick={handleTriggerRewrite}
                  disabled={rewriting || originalContent.trim().length < 10}
                  className="flex items-center gap-2 font-bold"
                >
                  {rewriting && <RefreshCw className="h-4 w-4 animate-spin" />}
                  <span>{rewriting ? 'Rewriting with AI...' : 'Rewrite Section'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* History column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
              <h3 className="text-body font-bold text-text-primary mb-4">Rewrite History</h3>
              {rewriteHistory.length === 0 ? (
                <p className="text-body-sm text-text-muted italic py-4">No previous rewrites found.</p>
              ) : (
                <div className="space-y-3">
                  {rewriteHistory.map((item) => (
                    <div
                      key={item.rewriteId}
                      onClick={() => navigate(`/resume-rewrite/compare/${item.rewriteId}`)}
                      className="group flex flex-col justify-between border border-border hover:border-primary/30 p-3.5 rounded-xl cursor-pointer hover:bg-surface-alt/25 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-body-sm font-bold text-text-primary group-hover:text-primary">
                            {item.sectionName}
                          </p>
                          <p className="text-[11px] text-text-muted mt-0.5">
                            Mode: {item.rewriteMode} • Status: {item.status}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-text-muted shrink-0 mt-1" />
                      </div>
                      <div className="flex items-center justify-between border-t border-border/40 mt-3 pt-2.5">
                        <span className="text-[10px] text-text-muted flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.createdAt)}
                        </span>
                        <button
                          onClick={(e) => handleDeleteHistory(e, item.rewriteId)}
                          className="text-text-muted hover:text-danger p-1 rounded-md hover:bg-danger-light dark:hover:bg-danger/20 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ResumeRewritePage;
