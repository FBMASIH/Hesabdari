'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import {
  cn,
  IconHome,
  IconCart,
  IconBag,
  IconWallet,
  IconBox,
  IconChart,
  IconSettings,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';

const nav = t('nav');

const tabs: { label: string; href: string; icon: ReactNode }[] = [
  { label: nav.home, href: '/', icon: <IconHome size={18} /> },
  { label: nav.sales, href: '/invoices', icon: <IconCart size={18} /> },
  { label: nav.purchases, href: '/vendors', icon: <IconBag size={18} /> },
  { label: nav.money, href: '/accounting', icon: <IconWallet size={18} /> },
  { label: nav.products, href: '/products', icon: <IconBox size={18} /> },
  { label: nav.reports, href: '/reports', icon: <IconChart size={18} /> },
  { label: nav.settings, href: '/settings', icon: <IconSettings size={18} /> },
];

export function PrimaryNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="ناوبری اصلی"
      className="mx-auto flex w-full max-w-[1440px] justify-center px-6 pt-1 pb-5"
    >
      <div className="glass-surface-static inline-flex items-center gap-1.5 rounded-2xl p-1.5">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href as never}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium transition-all duration-200',
                isActive
                  ? 'bg-bg-secondary text-fg-primary shadow-sm shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.04)]'
                  : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-secondary/50 active:bg-bg-secondary/30',
              )}
            >
              <span
                className={cn(
                  'transition-colors',
                  isActive ? 'text-brand-deep' : 'text-fg-tertiary',
                )}
              >
                {tab.icon}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
