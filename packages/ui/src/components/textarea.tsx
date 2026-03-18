import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[60px] w-full rounded-md border-[0.5px] border-border-primary bg-bg-secondary px-2.5 py-2 text-[13px] text-fg-primary shadow-inner transition-all',
          'placeholder:text-fg-tertiary',
          'focus:border-brand-deep focus:outline-none focus:ring-[3px] focus:ring-brand-deep/20',
          'disabled:cursor-not-allowed disabled:bg-bg-tertiary disabled:opacity-60',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
