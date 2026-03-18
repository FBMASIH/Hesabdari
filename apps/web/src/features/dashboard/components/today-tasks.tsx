import { EmptyState, IconDocument, IconUpload, IconDownload, IconTransfer } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const dash = t('dashboard');
const msgs = t('messages');
const common = t('common');

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
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
    <div className="glass-surface-static flex w-80 flex-col rounded-2xl p-5">
      <h2 className="text-base font-semibold text-fg-primary mb-4">{dash.todaysTasks}</h2>

      {/* Pending tasks — from API when available */}
      <div className="mb-5">
        <span className="text-xs font-medium text-fg-tertiary mb-2 block">{dash.pendingTasks}</span>
        <EmptyState
          title={common.noData}
          description={msgs.comingSoon}
          className="py-4"
        />
      </div>

      {/* Quick actions — static navigation links */}
      <div>
        <span className="text-xs font-medium text-fg-tertiary mb-2 block">{dash.quickActions}</span>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors hover:bg-bg-primary/60"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-brand-deep">
                {action.icon}
              </div>
              <span className="text-xs font-medium leading-tight text-fg-secondary">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
