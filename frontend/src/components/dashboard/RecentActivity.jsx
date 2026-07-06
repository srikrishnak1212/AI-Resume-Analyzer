import React from 'react';
import { Upload, Sparkles, LogIn, Clock } from 'lucide-react';
import DashboardCard from './DashboardCard';
import { formatRelativeTime } from '../../utils/formatDate';

/**
 * ActivityCard — Single row in activity log.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const ActivityCard = ({ activity }) => {
  const { type, title, description, timestamp } = activity;

  // Select icon and color based on activity type
  let Icon = Clock;
  let bgClass = 'bg-surface-alt text-text-secondary';

  if (type === 'upload') {
    Icon = Upload;
    bgClass = 'bg-primary-light text-primary dark:bg-primary-light/10';
  } else if (type === 'analysis') {
    Icon = Sparkles;
    bgClass = 'bg-success-light text-success dark:bg-success-light/10';
  } else if (type === 'login') {
    Icon = LogIn;
    bgClass = 'bg-info-light text-info dark:bg-info-light/10';
  }

  return (
    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-surface-alt transition-colors duration-150">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bgClass}`}>
        <Icon className="h-4.5 w-4.5" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-body-sm font-bold text-text-primary truncate">{title}</p>
          <span className="text-[10px] text-text-muted font-medium whitespace-nowrap">
            {formatRelativeTime(timestamp)}
          </span>
        </div>
        <p className="text-caption text-text-secondary mt-0.5 leading-relaxed break-words">
          {description}
        </p>
      </div>
    </div>
  );
};

/**
 * RecentActivity — Activity log list widget.
 */
const RecentActivity = ({ activities = [], className = '' }) => {
  return (
    <DashboardCard title="Recent Activity" subtitle="User timeline details" className={className}>
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-body-sm text-text-muted">No recent activities found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 divide-y divide-border/40">
          {activities.map((activity) => (
            <div key={activity.id} className="first:pt-0 pt-2.5">
              <ActivityCard activity={activity} />
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
};

export default RecentActivity;
export { ActivityCard };
