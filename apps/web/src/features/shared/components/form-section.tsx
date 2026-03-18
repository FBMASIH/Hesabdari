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
    <fieldset className={cn('glass-surface-static rounded-2xl p-5', className)}>
      <legend className="sr-only">{title}</legend>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-fg-primary">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-fg-tertiary">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}
