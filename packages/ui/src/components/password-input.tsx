'use client';

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/utils';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  renderToggle?: (visible: boolean, toggle: () => void) => ReactNode;
}

/** Password input — renders a bare `<input>` + optional toggle sibling via renderToggle */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, renderToggle, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const toggle = () => setVisible((v) => !v);

    const input = (
      <input
        type={visible ? 'text' : 'password'}
        className={cn(
          'flex h-[30px] w-full rounded-md border-[0.5px] border-border-primary bg-bg-secondary px-2.5 text-[13px] text-fg-primary shadow-inner transition-all',
          'placeholder:text-fg-tertiary',
          'focus:border-brand-deep focus:outline-none focus:ring-[3px] focus:ring-brand-deep/20',
          'disabled:cursor-not-allowed disabled:bg-bg-tertiary disabled:opacity-60',
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    if (!renderToggle) return input;

    return (
      <>
        {input}
        {renderToggle(visible, toggle)}
      </>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';
