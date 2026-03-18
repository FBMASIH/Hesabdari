import type { ReactNode } from 'react';
import { cn } from '@hesabdari/ui';

export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/** A titled section within a form — groups related fields. */
export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <fieldset className={cn('glass-surface-static rounded-2xl p-6', className)}>
      <legend className="sr-only">{title}</legend>
      <div className="mb-5">
        <h3 className="text-base font-semibold text-fg-primary">{title}</h3>
        {description && <p className="mt-1 text-xs text-fg-tertiary">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}
