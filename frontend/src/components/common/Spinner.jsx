import cn from '../../utils/cn';

/**
 * Spinner — Reusable loading spinner.
 * Supports inline, center, and fullscreen variations.
 *
 * Reference: UI-Guide.md §6.13 (Spinners)
 * Rule: Functional Component, Tailwind only (PROJECT_RULES.md)
 */
const Spinner = ({
  className,
  size = 'default',
  layout = 'inline',
}) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    default: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-border-strong border-t-primary',
        sizes[size],
        className
      )}
      role="status"
      aria-label="loading"
    />
  );

  if (layout === 'center') {
    return (
      <div className="flex w-full items-center justify-center p-6">
        {spinner}
      </div>
    );
  }

  if (layout === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Spinner;
