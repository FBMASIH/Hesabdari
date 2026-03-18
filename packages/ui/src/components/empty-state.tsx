import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

export interface EmptyStateProps {
  /** Icon or illustration. */
  icon?: ReactNode;
  /** Main message. */
  title: string;
  /** Secondary description. */
  description?: string;
  /** Call-to-action element (typically a Button). */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2.5 py-8 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-tertiary/60 text-fg-tertiary shadow-xs">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-fg-primary">{title}</p>
        {description && <p className="mt-1 text-xs text-fg-tertiary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
