import React from 'react';
import { Bell, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import DashboardCard from './DashboardCard';

/**
 * NotificationItem — Individual notification row.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const NotificationItem = ({ notification }) => {
  const { type, message, timestamp } = notification;

  let Icon = Bell;
  let iconClass = 'text-text-secondary';

  if (type === 'success') {
    Icon = CheckCircle2;
    iconClass = 'text-success';
  } else if (type === 'error') {
    Icon = AlertCircle;
    iconClass = 'text-danger';
  } else if (type === 'retry') {
    Icon = RefreshCw;
    iconClass = 'text-warning animate-spin-slow';
  } else if (type === 'completed') {
    Icon = Sparkles;
    iconClass = 'text-primary';
  }

  return (
    <div className="flex gap-3.5 p-3 rounded-lg hover:bg-surface-alt transition-colors duration-150">
      <div className="mt-0.5 shrink-0">
        <Icon className={`h-4.5 w-4.5 ${iconClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-sm text-text-primary leading-normal font-medium break-words">
          {message}
        </p>
        <span className="text-[10px] text-text-muted mt-1 inline-block font-semibold">
          {timestamp}
        </span>
      </div>
    </div>
  );
};

/**
 * NotificationPanel — Sidebar/panel of mock alerts.
 */
const NotificationPanel = ({ className = '' }) => {
  // Static mock notifications for design fidelity
  const mockNotifications = [
    {
      id: '1',
      type: 'completed',
      message: 'AI Resume Analysis completed successfully for Alice_Resume.pdf.',
      timestamp: '5m ago',
    },
    {
      id: '2',
      type: 'success',
      message: 'Resume Alice_Resume_v2.docx uploaded successfully.',
      timestamp: '15m ago',
    },
    {
      id: '3',
      type: 'retry',
      message: 'Gemini rate-limit corrective retry succeeded on attempt 2.',
      timestamp: '1h ago',
    },
    {
      id: '4',
      type: 'error',
      message: 'Parsing failed: File "corrupted.pdf" is encrypted or empty.',
      timestamp: '1d ago',
    },
  ];

  return (
    <DashboardCard title="System Notifications" subtitle="Real-time status updates" className={className}>
      <div className="flex flex-col gap-1 divide-y divide-border/40">
        {mockNotifications.map((notif) => (
          <div key={notif.id} className="first:pt-0 pt-2.5">
            <NotificationItem notification={notif} />
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default NotificationPanel;
export { NotificationItem };
