import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '../../components/common/AppLayout';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { listResumes } from '../../services/resumeService';
import { listJobMatches } from '../../services/jobMatchService';
import {
  generateCoverLetter,
  downloadCoverLetterPDF,
  downloadCoverLetterDOCX,
  listCoverLetters,
} from '../../services/coverLetterService';
import toast from 'react-hot-toast';
import {
  FileText,
  RefreshCw,
  Copy,
  Printer,
  FileDown,
  ArrowRight,
  Sparkles,
  User,
  Building,
  Target,
  Edit2,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TONES = [
  'Professional',
  'Friendly',
  'Formal',
  'Executive',
  'Internship',
  'Graduate',
  'Technical',
  'Career Change',
];

const LENGTHS = ['Short', 'Medium', 'Long'];

const CoverLetterPage = () => {
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  
  const [jobDescriptionId, setJobDescriptionId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [hiringManager, setHiringManager] = useState('');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium');

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState(null);
  
  // Editable live cover letter text
  const [editableText, setEditableText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const resumesData = await listResumes({ page: 1, limit: 50 });
      const completed = (resumesData.resumes || []).filter(r => r.parsingStatus === 'Completed');
      setResumes(completed);
      if (completed.length > 0) {
        setSelectedResumeId(completed[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load initial resume choices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedResumeId || !companyName || !jobTitle) {
      toast.error('Please select a resume, company name, and job title.');
      return;
    }

    try {
      setGenerating(true);
      toast('Generating cover letter with Gemini...');
      const letter = await generateCoverLetter({
        resumeId: selectedResumeId,
        jobDescriptionId: jobDescriptionId || undefined,
        companyName,
        jobTitle,
        hiringManager,
        tone,
        length,
      });

      setCoverLetter(letter);
      setEditableText(letter.coverLetterText);
      setIsEditing(false);
      toast.success('Cover letter generated!');
    } catch (err) {
      toast.error('Failed to generate cover letter.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableText);
    toast.success('Copied to clipboard!');
  };

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    // Open a new printable tab or write content to a small window
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Print Cover Letter</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 40px; line-height: 1.5; color: #333; }
            .meta { margin-bottom: 20px; font-size: 11pt; color: #555; }
            .subject { font-weight: bold; font-size: 12pt; margin-bottom: 20px; text-decoration: underline; }
            .body { font-size: 11pt; whitespace: pre-wrap; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleDownloadBlob = async (format) => {
    try {
      toast(`Downloading ${format.toUpperCase()}...`);
      const blob = format === 'pdf'
        ? await downloadCoverLetterPDF(coverLetter.coverLetterId)
        : await downloadCoverLetterDOCX(coverLetter.coverLetterId);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CoverLetter_${jobTitle.replace(/\s+/g, '_')}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error(`Failed to download ${format.toUpperCase()}.`);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <LoadingSkeleton className="h-12 w-1/3 rounded-xl" />
          <LoadingSkeleton className="h-96 w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary shadow-xs">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-h1 font-black text-text-primary">Cover Letter Generator</h1>
              <p className="text-body-sm text-text-muted mt-0.5">
                Build personalized, professional cover letters tailored to your target job profile.
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/cover-letter/history')}>
            View History
          </Button>
        </div>

        {coverLetter ? (
          /* Live Editor & sheet view */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Sheet Preview Card */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col">
                <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
                  <h3 className="text-body-sm font-bold text-text-secondary flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-primary" />
                    <span>Letter Sheet View</span>
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-1.5 text-caption font-bold text-primary hover:underline outline-none"
                  >
                    {isEditing ? <Check className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                    <span>{isEditing ? 'Finish Editing' : 'Edit Text'}</span>
                  </button>
                </div>

                <div ref={printRef} className="bg-surface font-serif leading-relaxed text-body-sm text-text-primary">
                  {isEditing ? (
                    <textarea
                      rows={20}
                      value={editableText}
                      onChange={(e) => setEditableText(e.target.value)}
                      className="w-full font-serif text-body-sm bg-surface-alt/10 border border-border rounded-xl p-4 focus:outline-none"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap px-4 py-2 font-serif text-[13.5px] leading-relaxed text-text-secondary">
                      <div className="text-[12px] text-text-muted font-mono mb-6 uppercase tracking-wider">
                        Date: {new Date(coverLetter.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="font-bold text-[14px] text-text-primary mb-1">
                        To: {hiringManager || 'Hiring Selection Committee'}
                      </div>
                      <div className="text-text-muted mb-1">Company: {companyName}</div>
                      <div className="text-text-muted mb-5">Position: {jobTitle}</div>
                      
                      <div className="font-bold text-[14px] text-text-primary mb-5 underline">
                        Re: Cover Letter for {jobTitle} Role
                      </div>

                      {editableText}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
                <h3 className="text-body font-bold text-text-primary">Letter Controls</h3>
                
                <Button
                  variant="primary"
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 font-bold"
                >
                  <Copy className="h-4.5 w-4.5" />
                  <span>Copy Letter text</span>
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Printer className="h-4.5 w-4.5" />
                  <span>Print Document</span>
                </Button>

                <div className="border-t border-border/80 pt-4 mt-4 grid grid-cols-2 gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => handleDownloadBlob('pdf')}
                    className="flex items-center justify-center gap-1.5 border border-border"
                  >
                    <FileDown className="h-4 w-4" />
                    <span>Download PDF</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDownloadBlob('docx')}
                    className="flex items-center justify-center gap-1.5 border border-border"
                  >
                    <FileDown className="h-4 w-4" />
                    <span>Download Word</span>
                  </Button>
                </div>

                <div className="border-t border-border/80 pt-4 mt-4 text-center">
                  <button
                    onClick={handleGenerate}
                    className="text-body-sm font-semibold text-primary hover:underline outline-none"
                  >
                    Regenerate with Gemini
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Input Configuration Setup Form */
          <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
            <h3 className="text-body font-bold text-text-primary border-b border-border pb-3">Letter Inputs</h3>

            {/* 1. Resume Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-body-sm font-bold text-text-secondary">
                1. Select Resume Profile
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-body-sm text-text-primary focus:border-primary focus:outline-none"
              >
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.fileName} (v{r.versionNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Target info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-body-sm font-bold text-text-secondary">
                  Company Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-muted" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Flipkart"
                    className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 text-body-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-body-sm font-bold text-text-secondary">
                  Job Position Name
                </label>
                <div className="relative">
                  <Target className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-muted" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Node Developer"
                    className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 text-body-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-body-sm font-bold text-text-secondary">
                Hiring Manager Name (Optional)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-muted" />
                <input
                  type="text"
                  value={hiringManager}
                  onChange={(e) => setHiringManager(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 text-body-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* 3. Tone & Length dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-body-sm font-bold text-text-secondary">
                  Cover Letter Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-body-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-body-sm font-bold text-text-secondary">
                  Cover Letter Length
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-body-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  {LENGTHS.map((len) => (
                    <option key={len} value={len}>
                      {len}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate trigger */}
            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                onClick={handleGenerate}
                disabled={generating || !companyName || !jobTitle}
                className="flex items-center gap-2 font-bold w-full sm:w-auto"
              >
                {generating && <RefreshCw className="h-4 w-4 animate-spin" />}
                <span>{generating ? 'Generating Letter...' : 'Generate Cover Letter'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CoverLetterPage;
