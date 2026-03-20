'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  cn,
  IconMagnifer,
  IconHome,
  IconCart,
  IconBag,
  IconWallet,
  IconBox,
  IconChart,
  IconSettings,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { UserMenu } from './user-menu';
import { SpotlightSearch, SHORTCUT_LABEL } from './spotlight-search';

const nav = t('nav');
const common = t('common');

type NavHref =
  | '/'
  | '/invoices'
  | '/vendors'
  | '/accounting'
  | '/products'
  | '/reports'
  | '/settings';

const tabs: { label: string; href: NavHref; icon: ReactNode }[] = [
  { label: nav.home, href: '/', icon: <IconHome size={16} /> },
  { label: nav.sales, href: '/invoices', icon: <IconCart size={16} /> },
  { label: nav.purchases, href: '/vendors', icon: <IconBag size={16} /> },
  { label: nav.money, href: '/accounting', icon: <IconWallet size={16} /> },
  { label: nav.products, href: '/products', icon: <IconBox size={16} /> },
  { label: nav.reports, href: '/reports', icon: <IconChart size={16} /> },
  { label: nav.settings, href: '/settings', icon: <IconSettings size={16} /> },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent): void {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSpotlightOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="ambient-bg flex min-h-screen flex-col">
      {/* ── Unified floating header ── */}
      <header className="sticky top-0 z-sticky mx-auto flex w-full max-w-[var(--content-max-width)] items-center gap-3 px-6 pt-4 pb-3">
        <div className="glass-surface-static flex h-12 w-full items-center gap-2 rounded-2xl px-2">
          {/* Brand mark — start (right in RTL) */}
          <Link
            href="/"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-brand-deep text-xs font-bold text-primary-fg shadow-brand-ring transition-transform duration-150 hover:scale-105 active:scale-95"
            aria-label={common.brandName}
          >
            T
          </Link>

          {/* Separator */}
          <div className="h-5 w-px bg-border-secondary/60 flex-shrink-0" />

          {/* Navigation tabs — center, scrollable */}
          <nav aria-label={nav.mainNav} className="nav-scroll-container flex-1 overflow-x-auto">
            <div className="flex items-center gap-0.5 px-1">
              {tabs.map((tab) => {
                const isActive =
                  tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-[13px] font-medium transition-all duration-200',
                      isActive
                        ? 'bg-bg-secondary text-fg-primary shadow-sm'
                        : 'text-fg-tertiary hover:text-fg-secondary hover:bg-bg-secondary/40',
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
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Separator */}
          <div className="h-5 w-px bg-border-secondary/60 flex-shrink-0" />

          {/* Right utilities — search + user */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Search trigger */}
            <button
              type="button"
              onClick={() => setSpotlightOpen(true)}
              aria-label={common.search}
              aria-keyshortcuts="Control+k"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-fg-tertiary transition-colors hover:bg-bg-secondary/50 hover:text-fg-secondary"
              title={`${common.search} (${SHORTCUT_LABEL})`}
            >
              <IconMagnifer size={16} />
            </button>

            {/* User profile menu */}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto w-full max-w-[var(--content-max-width)] flex-1 px-8 pt-4 pb-12">
        {children}
      </main>

      <SpotlightSearch open={spotlightOpen} onOpenChange={setSpotlightOpen} />
    </div>
  );
}
