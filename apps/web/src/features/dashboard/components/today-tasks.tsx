import { type ReactNode } from 'react';
import Link from 'next/link';
import {
  EmptyState,
  IconDocument,
  IconUpload,
  IconDownload,
  IconTransfer,
  IconClipboardList,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const dash = t('dashboard');

interface QuickAction {
  label: string;
  href: '/invoices/new' | '/journal-entries/new';
  icon: ReactNode;
}

const quickActions: QuickAction[] = [
  {
    label: dash.newSalesInvoice,
    href: '/invoices/new',
    icon: <IconDocument size={16} />,
  },
  {
    label: dash.recordReceipt,
    href: '/journal-entries/new',
    icon: <IconUpload size={16} />,
  },
  {
    label: dash.recordPayment,
    href: '/journal-entries/new',
    icon: <IconDownload size={16} />,
  },
  {
    label: dash.transferFunds,
    href: '/journal-entries/new',
    icon: <IconTransfer size={16} />,
  },
];

export function TodayTasks() {
  return (
    <div className="glass-surface-static flex flex-col rounded-2xl p-5">
      <h2 className="text-base font-semibold text-fg-primary mb-4">{dash.todaysTasks}</h2>

      {/* Pending tasks — from API when available */}
      <div className="mb-5">
        <span className="text-xs font-medium text-fg-tertiary mb-2 block">{dash.pendingTasks}</span>
        <EmptyState
          icon={<IconClipboardList size={18} />}
          title={dash.noPendingTasks}
          description={dash.noPendingTasksDescription}
          className="py-4"
        />
      </div>

      {/* Quick actions — static navigation links */}
      <div>
        <span className="text-xs font-medium text-fg-tertiary mb-2 block">{dash.quickActions}</span>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-all duration-150 hover:bg-bg-tertiary/50 hover:shadow-xs active:scale-[0.97]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-brand-deep shadow-xs">
                {action.icon}
              </div>
              <span className="text-xs font-medium leading-tight text-fg-secondary">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
