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
  { label: nav.products, href: '/products' },
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
                  ? 'bg-bg-secondary text-fg-primary shadow-sm shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.04)]'
                  : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-secondary/50 active:bg-bg-secondary/30',
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
