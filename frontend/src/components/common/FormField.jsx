import { forwardRef } from 'react';
import Input from './Input';
import cn from '../../utils/cn';

/**
 * FormField — Wraps an Input component with a label and validation error.
 *
 * Reference: UI-Guide.md §5.6, §6.5
 * Rule: Functional Component + Hooks/forwardRef, Tailwind only (PROJECT_RULES.md)
 */
const FormField = forwardRef(
  (
    {
      label,
      id,
      error,
      className,
      required,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('flex flex-col gap-1.5 w-full', className)}>
        {label && (
          <label
            htmlFor={id}
            className="text-label text-text-secondary select-none font-semibold"
          >
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        <Input
          ref={ref}
          id={id}
          error={error}
          {...props}
        />

        {error && (
          <p className="text-caption text-danger animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
