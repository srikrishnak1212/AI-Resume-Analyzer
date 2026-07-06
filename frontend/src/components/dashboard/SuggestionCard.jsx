import React from 'react';
import { Lightbulb, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * SuggestionCard — Actionable suggestions list (quick wins).
 *
 * Reference: UI-Guide.md §7.7, AI-Prompts.md §2.1
 */
const SuggestionCard = ({ suggestions = [] }) => {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Suggestion copied to clipboard!');
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-text-primary flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-warning" />
        Quick Wins & Actionable Steps
      </h3>
      {suggestions.length > 0 ? (
        <ol className="space-y-4">
          {suggestions.map((sug, idx) => (
            <li key={idx} className="group flex items-start justify-between gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <div className="flex gap-3 text-sm text-text-secondary">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-light text-primary text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{sug}</span>
              </div>
              <button
                onClick={() => handleCopy(sug)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface-alt rounded text-text-muted hover:text-text-primary transition-opacity shrink-0 self-center"
                title="Copy suggestion text"
              >
                <Copy className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-text-muted">No quick wins suggestions evaluated.</p>
      )}
    </div>
  );
};

export default SuggestionCard;
