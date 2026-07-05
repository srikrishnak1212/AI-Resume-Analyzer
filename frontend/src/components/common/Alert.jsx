import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import cn from '../../utils/cn';

/**
 * Alert — Inline feedback banner.
 * Supports: success, warning, danger, info.
 *
 * Reference: UI-Guide.md §6.11
 * Rule: Functional Component, Tailwind only, no inline CSS (PROJECT_RULES.md)
 */
const Alert = ({
  children,
  className,
  variant = 'info',
  onDismiss,
  title,
}) => {
  const styles = {
    success: 'bg-success-light border-success text-success',
    warning: 'bg-warning-light border-warning text-warning',
    danger: 'bg-danger-light border-danger text-danger',
    info: 'bg-primary-light border-primary text-primary',
  };

  const icons = {
    success: CheckCircle,
    warning: AlertCircle,
    danger: AlertCircle,
    info: Info,
  };

  const Icon = icons[variant];

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 p-4 rounded-md border-l-4 text-body leading-relaxed animate-fade-in',
        styles[variant],
        className
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />

      <div className="flex-1">
        {title && (
          <h4 className="font-semibold text-body-lg mb-1 leading-tight">
            {title}
          </h4>
        )}
        <div>{children}</div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-current hover:opacity-75 transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
