import { forwardRef, type HTMLAttributes, type LabelHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  error?: string;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, error, children, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      {children}
      {error && <FormMessage>{error}</FormMessage>}
    </div>
  ),
);
FormField.displayName = 'FormField';

export function FormLabel({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none text-fg-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  );
}

export function FormMessage({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p className={cn('text-xs font-medium text-danger', className)} {...props}>
      {children}
    </p>
  );
}
