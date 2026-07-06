import React, { useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import { createTextJobDescription } from '../../services/jobMatchService';
import toast from 'react-hot-toast';

/**
 * JobDescriptionEditor — Textarea editor for pasting job descriptions.
 */
const JobDescriptionEditor = ({ onUploadSuccess, jobTitle = '', companyName = '' }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTextSubmit = async () => {
    if (text.trim().length < 50) {
      setError('Job description text must be at least 50 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      toast('Extracting details from job description...');
      const result = await createTextJobDescription({
        jobTitle,
        companyName,
        text: text.trim(),
      });
      
      toast.success('Details extracted successfully!');
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message || 'Failed to parse text.';
      setError(errMsg);
      toast.error('Failed to parse text.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-body-sm font-bold text-text-secondary">
          Paste Job Description Text
        </label>
        <textarea
          rows={10}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value.trim().length >= 50) setError('');
          }}
          placeholder="Paste the target job description details here. Include required skills, responsibilities, years of experience, and role expectations..."
          className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-body-sm text-text-primary placeholder:text-text-muted hover:border-primary/30 focus:border-primary focus:outline-none transition-colors duration-150 resize-y min-h-[160px]"
        />
        <div className="flex justify-between items-center px-1 text-caption text-text-muted font-medium">
          <span>Min. 50 characters</span>
          <span>{text.length} characters</span>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-danger/5 border border-danger/20 p-4 text-danger">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-body-sm font-medium leading-relaxed">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleTextSubmit}
          disabled={loading || text.trim().length < 50}
          className="flex items-center gap-2"
        >
          {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
          <span>{loading ? 'Processing Text...' : 'Analyze & Extract Details'}</span>
        </Button>
      </div>
    </div>
  );
};

export default JobDescriptionEditor;
