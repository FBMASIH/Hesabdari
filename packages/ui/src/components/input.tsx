import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

/** macOS-style text input — compact, inset shadow, blue focus border */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-[30px] w-full rounded-lg border-[0.5px] border-border-primary bg-bg-secondary px-2.5 text-[13px] text-fg-primary shadow-inner transition-[border-color,box-shadow] duration-150',
          'placeholder:text-fg-tertiary',
          'hover:border-border-primary/100',
          'focus:border-brand-deep focus:outline-none focus:ring-[3px] focus:ring-brand-deep/15 focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_3px_rgba(74,141,184,0.15)]',
          'disabled:cursor-not-allowed disabled:bg-bg-tertiary disabled:opacity-60',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
