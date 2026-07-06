import React from 'react';
import { Calendar, Filter, RotateCcw } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

/**
 * AnalyticsFilters — Interactive form selectors to filter analysis queries.
 * Supports resume, date range, and score filters.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const AnalyticsFilters = ({
  resumes = [],
  filters = {},
  onChange,
  onReset,
  className = '',
}) => {
  const handleSelectResume = (e) => {
    onChange({ resumeId: e.target.value });
  };

  const handleScoreChange = (key, value) => {
    onChange({ [key]: value ? Number(value) : undefined });
  };

  const handleDateChange = (key, value) => {
    onChange({ [key]: value || undefined });
  };

  return (
    <div className={`rounded-xl border border-border bg-surface p-4 shadow-xs ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-border pb-3">
        <div className="flex items-center gap-2 text-text-primary font-bold text-body-sm">
          <Filter className="h-4.5 w-4.5 text-primary" />
          <span>Interactive Filters</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="flex items-center gap-1.5 text-text-muted hover:text-text-primary font-bold text-caption py-1 px-2.5 rounded-lg"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Filters</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Resume Selector */}
        <div className="space-y-1.5">
          <label htmlFor="filter-resume" className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Select Resume
          </label>
          <select
            id="filter-resume"
            value={filters.resumeId || ''}
            onChange={handleSelectResume}
            disabled={resumes.length === 0}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-body-sm text-text-primary font-medium focus:border-primary focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Resumes</option>
            {resumes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.fileName} (v{r.versionNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Score Min / Max */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Overall Score Range
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="Min"
              value={filters.minScore ?? ''}
              onChange={(e) => handleScoreChange('minScore', e.target.value)}
              className="py-1 px-3 text-body-sm"
            />
            <span className="text-text-muted font-bold text-caption">to</span>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="Max"
              value={filters.maxScore ?? ''}
              onChange={(e) => handleScoreChange('maxScore', e.target.value)}
              className="py-1 px-3 text-body-sm"
            />
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <label htmlFor="filter-start-date" className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
            <Calendar className="h-3 w-3 text-icon-default" />
            <span>Start Date</span>
          </label>
          <Input
            id="filter-start-date"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="py-1.5 px-3 text-body-sm"
          />
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <label htmlFor="filter-end-date" className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
            <Calendar className="h-3 w-3 text-icon-default" />
            <span>End Date</span>
          </label>
          <Input
            id="filter-end-date"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="py-1.5 px-3 text-body-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;
