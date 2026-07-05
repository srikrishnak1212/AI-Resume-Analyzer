import { forwardRef } from 'react';
import cn from '../../utils/cn';

/**
 * Input — Premium form input field.
 * Supports icons, error states, and disabled styling.
 *
 * Reference: UI-Guide.md §5.6 (Input Variants), §6.5
 * Rule: Functional Component, Hook/Ref forward, Tailwind only (PROJECT_RULES.md)
 */
const Input = forwardRef(
  (
    {
      className,
      type = 'text',
      error,
      icon: Icon,
      rightElement,
      isDisabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-icon-default">
            <Icon className="h-4 w-4" strokeWidth={2} />
          </div>
        )}

        <input
          ref={ref}
          type={type}
          disabled={isDisabled}
          className={cn(
            'flex h-10 w-full rounded-md border bg-surface px-3 py-2 text-body transition-all duration-150 placeholder:text-text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-text-muted disabled:placeholder:text-text-muted/60',
            // Default border and focus states
            'border-border-strong text-text-primary focus:border-primary focus:ring-3 focus:ring-primary/20',
            // Error states
            error && 'border-danger text-danger focus:border-danger focus:ring-3 focus:ring-danger/20',
            // Spacing for left icon
            Icon && 'pl-10',
            // Spacing for right element (like password show/hide button)
            rightElement && 'pr-10',
            className
          )}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
