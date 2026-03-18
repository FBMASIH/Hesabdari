'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const nav = t('nav');

const tabs = [
  { label: nav.home, href: '/' },
  { label: nav.sales, href: '/invoices' },
  { label: nav.purchases, href: '/vendors' },
  { label: nav.money, href: '/accounting' },
  { label: nav.products, href: '/customers' },  // TODO: change href to /inventory when inventory page is built
  { label: nav.reports, href: '/reports' },
] as const;

export function PrimaryNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="ناوبری اصلی" className="mx-auto flex w-full max-w-[1440px] justify-center px-6 pb-2">
      <div className="glass-surface-static inline-flex items-center gap-1 rounded-2xl p-1.5">
        {tabs.map((tab) => {
          const isActive =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'rounded-xl px-5 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-bg-secondary text-fg-primary shadow-sm'
                  : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-secondary/40',
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
