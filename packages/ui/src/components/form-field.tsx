import { forwardRef, type HTMLAttributes, type LabelHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  error?: string;
}

/** Form field wrapper — adds spacing, error state styling, and error message */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, error, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-2', error && 'form-field-error', className)}
      {...props}
    >
      {children}
      {error && <FormMessage>{error}</FormMessage>}
    </div>
  ),
);
FormField.displayName = 'FormField';

/** macOS-style label — 13px, medium weight */
export function FormLabel({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'text-[13px] font-medium text-fg-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}

/** Error message with breathing room and soft styling */
export function FormMessage({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p
      className={cn(
        'text-[12px] leading-relaxed text-danger-default',
        className,
      )}
      role="alert"
      {...props}
    >
      {children}
    </p>
  );
}
