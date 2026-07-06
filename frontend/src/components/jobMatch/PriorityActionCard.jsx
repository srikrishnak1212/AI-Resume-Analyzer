import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';

/**
 * PriorityActionCard — Prominent callout card list for immediate corrective resume updates.
 */
const PriorityActionCard = ({ actions = [] }) => {
  if (actions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-light/30 to-background dark:from-primary-light/10 dark:to-surface p-6 shadow-xs">
      <div className="flex items-center gap-2.5 text-primary mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <Zap className="h-5 w-5 fill-primary" strokeWidth={1.8} />
        </div>
        <div>
          <h3 className="text-body font-black">Priority Action List</h3>
          <p className="text-[11px] text-text-muted mt-0.5 uppercase tracking-wider font-bold">
            High-Impact Corrections
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {actions.map((act, index) => (
          <div
            key={index}
            className="flex items-start gap-3 bg-surface border border-border/60 hover:border-primary/30 p-4 rounded-xl transition-colors duration-200"
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary text-caption font-bold mt-0.5">
              {index + 1}
            </div>
            <p className="text-body-sm text-text-primary font-medium flex-1 leading-relaxed">
              {act}
            </p>
            <ArrowRight className="h-4 w-4 text-text-muted mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityActionCard;
