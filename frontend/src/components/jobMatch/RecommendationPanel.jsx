import React, { useState } from 'react';
import { Lightbulb, Edit3, ShieldAlert, Award } from 'lucide-react';

/**
 * RecommendationPanel — Tabbed interface displaying detailed matching feedback.
 */
const RecommendationPanel = ({
  recommendations = [],
  improvements = [],
  strengths = [],
  weaknesses = [],
}) => {
  const [activeTab, setActiveTab] = useState('recs');

  const tabs = [
    { id: 'recs', label: 'Match Recommendations', icon: Lightbulb, count: recommendations.length, data: recommendations, color: 'text-primary bg-primary-light dark:bg-primary/20' },
    { id: 'improvements', label: 'Resume Fixes', icon: Edit3, count: improvements.length, data: improvements, color: 'text-info bg-info-light dark:bg-info/20' },
    { id: 'strengths', label: 'Key Strengths', icon: Award, count: strengths.length, data: strengths, color: 'text-success bg-success-light dark:bg-success/20' },
    { id: 'weaknesses', label: 'Weakness Gaps', icon: ShieldAlert, count: weaknesses.length, data: weaknesses, color: 'text-danger bg-danger-light dark:bg-danger/20' },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-xs flex flex-col">
      {/* Tabs list */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-body-sm font-semibold border-b-2 transition-all whitespace-nowrap outline-none ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface-alt/40'
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span>{tab.label}</span>
              <span className={`h-5 px-1.5 min-w-5 inline-flex items-center justify-center rounded-full text-caption font-bold ${tab.color}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current tab details */}
      <div className="p-6">
        {currentTab.data.length === 0 ? (
          <p className="text-body-sm text-text-muted italic py-4">No points reported for this category.</p>
        ) : (
          <ul className="space-y-3.5">
            {currentTab.data.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-body-sm text-text-secondary leading-relaxed border-b border-border/40 last:border-0 pb-3 last:pb-0"
              >
                <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecommendationPanel;
