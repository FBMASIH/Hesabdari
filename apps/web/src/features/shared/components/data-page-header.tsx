'use client';

import type { ReactNode } from 'react';
import { Button } from '@hesabdari/ui';

export interface DataPageHeaderProps {
  title: string;
  subtitle: string;
  /** Primary action button (e.g. "فاکتور جدید"). */
  action?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
}

export function DataPageHeader({ title, subtitle, action }: DataPageHeaderProps) {
  return (
    <div className="flex items-start justify-between pb-5">
      <div>
        <h1 className="text-xl font-semibold text-fg-primary">{title}</h1>
        <p className="mt-1 text-sm text-fg-tertiary">{subtitle}</p>
      </div>
      {action && (
        <Button type="button" onClick={action.onClick}>
          {action.icon && <span aria-hidden="true">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </div>
  );
}
