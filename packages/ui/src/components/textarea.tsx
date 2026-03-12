import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-border-primary bg-bg-primary px-3 py-2 text-sm text-fg-primary shadow-xs transition-colors',
          'placeholder:text-fg-tertiary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
