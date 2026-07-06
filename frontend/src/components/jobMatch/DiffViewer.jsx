import React from 'react';

/**
 * Longest Common Subsequence (LCS) word-level diffing algorithm
 */
const diffWords = (originalText = '', revisedText = '') => {
  const original = originalText.split(/(\s+)/).filter(Boolean);
  const revised = revisedText.split(/(\s+)/).filter(Boolean);

  const n = original.length;
  const m = revised.length;

  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (original[i - 1] === revised[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = n;
  let j = m;
  const changes = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && original[i - 1] === revised[j - 1]) {
      changes.push({ type: 'unchanged', val: original[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      changes.push({ type: 'added', val: revised[j - 1] });
      j--;
    } else {
      changes.push({ type: 'removed', val: original[i - 1] });
      i--;
    }
  }

  changes.reverse();
  return changes;
};

/**
 * DiffViewer — Highlights insertions in green and deletions in red.
 */
const DiffViewer = ({ original = '', revised = '' }) => {
  const diffs = diffWords(original, revised);

  return (
    <div className="rounded-2xl border border-border bg-surface-alt/25 p-5 font-mono text-body-sm leading-relaxed max-h-[400px] overflow-y-auto whitespace-pre-wrap shadow-inner">
      {diffs.map((part, idx) => {
        if (part.type === 'added') {
          return (
            <span
              key={idx}
              className="bg-success/20 dark:bg-success/35 text-success font-semibold px-0.5 rounded-sm"
              title="Added by AI"
            >
              {part.val}
            </span>
          );
        }
        if (part.type === 'removed') {
          return (
            <span
              key={idx}
              className="bg-danger/15 dark:bg-danger/30 text-danger/80 line-through px-0.5 rounded-sm"
              title="Removed by AI"
            >
              {part.val}
            </span>
          );
        }
        return <span key={idx} className="text-text-secondary">{part.val}</span>;
      })}
    </div>
  );
};

export default DiffViewer;
export { diffWords };
