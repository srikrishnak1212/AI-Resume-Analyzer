import { forwardRef } from 'react';
import cn from '../../utils/cn';

/**
 * Button — Premium reusable button component.
 * Supports variants, sizes, loading states, and icon layouts.
 *
 * Reference: UI-Guide.md §5.5 (Button Variants), §6.4
 * Rule: Functional Component, Tailwind only, no inline CSS (PROJECT_RULES.md)
 */
const Button = forwardRef(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'default',
      isLoading = false,
      isDisabled = false,
      icon: Icon,
      iconPosition = 'left',
      type = 'button',
      ...props
    },
    ref
  ) => {
    // ── Variants ─────────────────────────────────────────────────────────────
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm active:scale-[0.98]',
      secondary: 'bg-surface text-text-primary border border-border-strong hover:bg-surface-alt hover:text-text-primary active:scale-[0.98]',
      ghost: 'bg-transparent text-text-secondary hover:bg-surface-alt hover:text-text-primary',
      destructive: 'bg-danger text-white hover:bg-opacity-90 active:scale-[0.98]',
      disabled: 'bg-surface-alt text-text-muted border border-border cursor-not-allowed opacity-60',
    };

    // ── Sizes ────────────────────────────────────────────────────────────────
    const sizes = {
      sm: 'h-8 px-3 text-body-sm rounded-sm',
      default: 'h-10 px-4 text-btn rounded-md',
      lg: 'h-12 px-6 text-body-lg font-semibold rounded-lg',
    };

    const isBtnDisabled = isDisabled || isLoading;
    const activeVariant = isBtnDisabled ? 'disabled' : variant;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isBtnDisabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
          variants[activeVariant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin text-current"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!isLoading && Icon && iconPosition === 'left' && (
          <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
        )}

        <span>{children}</span>

        {!isLoading && Icon && iconPosition === 'right' && (
          <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
