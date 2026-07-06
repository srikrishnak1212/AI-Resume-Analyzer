import React, { useState, useEffect } from 'react';
import { Sparkles, ScanEye } from 'lucide-react';

/**
 * AIThinkingIndicator — Premium progress indicator showing rotating evaluation stages.
 *
 * Reference: UI-Guide.md §6.13, §1.4
 */
const AIThinkingIndicator = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Initializing Google Gemini intelligence...',
    'Injecting recruiter context rules...',
    'Performing deep layout parsing...',
    'Analyzing grammar, tone, and active verbs...',
    'Assessing Applicant Tracking System (ATS) compatibility...',
    'Extracting hard and soft skills categories...',
    'Evaluating project bullets and quantified results...',
    'Calibrating scoring dimensions...',
    'Compiling final professional recommendations...'
  ];

  useEffect(() => {
    // Cycle through status texts every 2.8 seconds
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-12 text-center shadow-md max-w-lg mx-auto my-12">
      {/* Premium animated rings */}
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
        {/* Shimmer outer ring */}
        <div className="absolute inset-0 animate-ping rounded-full border border-primary/20 opacity-75" />
        {/* Shimmer middle ring */}
        <div className="absolute inset-2 animate-spin rounded-full border border-dashed border-secondary/50 duration-10000" />
        {/* Inner solid ring */}
        <div className="absolute inset-4 rounded-full bg-primary-light flex items-center justify-center text-primary">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>
      </div>

      <h3 className="mb-2 text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
        <ScanEye className="h-5 w-5 text-secondary animate-bounce" />
        AI Engine Analyzing
      </h3>
      
      {/* Rotating subtitle */}
      <p className="min-h-[24px] text-sm font-medium text-text-secondary transition-all duration-300">
        {steps[currentStep]}
      </p>

      <div className="mt-6 w-full max-w-[240px] rounded-full bg-surface-alt h-1.5 overflow-hidden">
        <div className="bg-primary h-full animate-infinite-loading rounded-full" style={{ width: '40%' }} />
      </div>

      <p className="mt-8 text-xs text-text-muted">
        This takes approximately 10 to 20 seconds. Please do not close this page.
      </p>
    </div>
  );
};

export default AIThinkingIndicator;
