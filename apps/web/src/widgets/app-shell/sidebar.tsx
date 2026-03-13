'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const nav = t('nav');

const navigation = [
  { name: nav.dashboard, href: '/' },
  { name: nav.accounting, href: '/accounting' },
  { name: nav.journalEntries, href: '/journal-entries' },
  { name: nav.invoices, href: '/invoices' },
  { name: nav.customers, href: '/customers' },
  { name: nav.vendors, href: '/vendors' },
  { name: nav.reports, href: '/reports' },
  { name: nav.settings, href: '/settings' },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-s border-border-primary bg-bg-secondary">
      <div className="flex h-14 items-center border-b border-border-primary px-6">
        <span className="text-lg font-bold text-fg-primary">{t('common').appName}</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-subtle text-primary'
                  : 'text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary',
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
