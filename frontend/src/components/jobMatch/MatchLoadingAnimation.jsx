import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, Circle } from 'lucide-react';

/**
 * MatchLoadingAnimation — Sequenced, premium AI loading state displaying match progress indicators.
 */
const MatchLoadingAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Comparing Skills...',
    'Comparing Experience...',
    'Checking ATS Keywords...',
    'Generating Suggestions...',
  ];

  useEffect(() => {
    const intervals = [1200, 2400, 3600, 4800];
    const timers = intervals.map((time, index) =>
      setTimeout(() => {
        setCurrentStep(index + 1);
      }, time)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto my-12 text-center space-y-6">
      {/* Central Pulsing Glow Icon */}
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-light/50 text-primary border border-primary/20 shadow-lg shadow-primary-light/40 dark:shadow-none animate-pulse">
        <RefreshCw className="h-10 w-10 animate-spin" strokeWidth={1.8} />
      </div>

      <div className="space-y-1">
        <h3 className="text-body font-black text-text-primary">Comparing Profile to Role</h3>
        <p className="text-body-sm text-text-secondary leading-relaxed">
          Google Gemini is analyzing the alignments and gaps...
        </p>
      </div>

      {/* Sequenced Checklist */}
      <div className="w-full bg-surface-alt/60 rounded-2xl p-5 border border-border/80 text-left space-y-3.5">
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isActive = currentStep === idx;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 transition-opacity duration-300 ${
                isDone || isActive ? 'opacity-100' : 'opacity-40'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              ) : isActive ? (
                <RefreshCw className="h-5 w-5 text-primary shrink-0 animate-spin" />
              ) : (
                <Circle className="h-5 w-5 text-text-muted shrink-0" />
              )}
              <span
                className={`text-body-sm font-semibold ${
                  isActive ? 'text-primary font-bold' : isDone ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchLoadingAnimation;
