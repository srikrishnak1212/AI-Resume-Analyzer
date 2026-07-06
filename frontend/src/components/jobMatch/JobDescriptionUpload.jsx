import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../common/Button';
import { uploadFileJobDescription } from '../../services/jobMatchService';
import toast from 'react-hot-toast';

/**
 * JobDescriptionUpload — Drag-and-drop component to upload job description files (.pdf, .docx, .txt).
 */
const JobDescriptionUpload = ({ onUploadSuccess, jobTitle = '', companyName = '' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const allowedExtensions = ['.pdf', '.docx', '.txt'];

  const validateFile = (selectedFile) => {
    setError('');
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      setError('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
      return false;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleUploadSubmit = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('jobDescription', file);
      if (jobTitle) formData.append('jobTitle', jobTitle);
      if (companyName) formData.append('companyName', companyName);

      toast('Uploading and parsing job description...');
      const result = await uploadFileJobDescription(formData);
      toast.success('Job description parsed successfully!');
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message || 'Failed to process file.';
      setError(errMsg);
      toast.error('Failed to parse file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
          dragActive
            ? 'border-primary bg-primary-light/10'
            : 'border-border bg-surface hover:bg-surface-alt/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={handleChange}
        />

        {!file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-alt text-text-secondary border border-border">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-body-sm font-semibold text-text-primary">
                Drag and drop your job description file here
              </p>
              <p className="text-caption text-text-muted mt-1">
                Supports PDF, DOCX, or TXT (Max 5MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-body-sm font-bold text-text-primary">{file.name}</p>
              <p className="text-caption text-text-muted mt-0.5">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-danger/5 border border-danger/20 p-4 text-danger">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-body-sm font-medium leading-relaxed">{error}</p>
        </div>
      )}

      {file && (
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setFile(null)}
            disabled={uploading}
          >
            Clear File
          </Button>
          <Button
            variant="primary"
            onClick={handleUploadSubmit}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading && <RefreshCw className="h-4 w-4 animate-spin" />}
            <span>{uploading ? 'Processing File...' : 'Parse & Extract Details'}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobDescriptionUpload;
