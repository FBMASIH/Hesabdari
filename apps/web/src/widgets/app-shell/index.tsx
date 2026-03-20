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

type NavHref = '/' | '/invoices' | '/vendors' | '/accounting' | '/products' | '/reports';

const tabs: { label: string; href: NavHref; icon: ReactNode }[] = [
  { label: nav.home, href: '/', icon: <IconHome size={16} /> },
  { label: nav.sales, href: '/invoices', icon: <IconCart size={16} /> },
  { label: nav.purchases, href: '/vendors', icon: <IconBag size={16} /> },
  { label: nav.money, href: '/accounting', icon: <IconWallet size={16} /> },
  { label: nav.products, href: '/products', icon: <IconBox size={16} /> },
  { label: nav.reports, href: '/reports', icon: <IconChart size={16} /> },
];

/** Shared capsule styles */
const CAPSULE = 'nav-capsule h-[50px] rounded-full';
/** Shared inner element size (brand icon, search icon, settings icon, avatar) */
const ICON_PILL = 'h-[38px] w-[38px] items-center justify-center rounded-full';
/** Theme-aware subtle hover — uses fg-primary so it adapts to light/dark */
const HOVER_SUBTLE = 'nav-hover-subtle';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [spotlightOpen, setSpotlightOpen] = useState(false);

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
    <div className="app-shell-bg flex min-h-screen flex-col">
      {/* ── Three separated capsules — grid keeps nav centered ── */}
      <header className="app-shell-header sticky top-0 z-sticky w-full px-6 pt-5 pb-3">
        <div className="mx-auto grid max-w-[var(--content-max-width)] grid-cols-[auto_1fr_auto] items-center gap-4 mb-2">
          {/* ━━ Capsule 1: Brand ━━ */}
          <Link
            href="/"
            className={cn(CAPSULE, 'flex items-center gap-3 pe-5 ps-1.5 flex-shrink-0')}
            aria-label={common.brandName}
          >
            <div
              className={cn(
                'flex',
                ICON_PILL,
                'bg-brand-deep text-sm font-bold text-primary-fg shadow-sm',
              )}
            >
              T
            </div>
            <span className="hidden md:block text-[15px] font-semibold text-fg-primary">
              {common.brandName}
            </span>
          </Link>

          {/* ━━ Capsule 2: Nav tabs — centered ━━ */}
          <nav
            aria-label={nav.mainNav}
            className={cn(
              CAPSULE,
              'justify-self-center overflow-x-auto scrollbar-none flex items-center',
            )}
          >
            <div className="flex items-center gap-1.5 px-1.5">
              {tabs.map((tab) => {
                const isActive =
                  tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'nav-tab-item flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2 text-[13.5px] font-medium transition-all duration-200',
                      isActive
                        ? 'text-primary-fg shadow-sm'
                        : 'text-fg-secondary hover:text-fg-primary',
                    )}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* ━━ Capsule 3: Search + Settings + Profile ━━ */}
          <div className={cn(CAPSULE, 'flex items-center gap-1.5 px-1.5 flex-shrink-0')}>
            {/* Search bar (desktop) */}
            <button
              type="button"
              onClick={() => setSpotlightOpen(true)}
              aria-label={common.search}
              aria-keyshortcuts="Control+k"
              title={`${common.search} (${SHORTCUT_LABEL})`}
              className={cn(
                HOVER_SUBTLE,
                'hidden lg:flex items-center gap-2 h-[38px] rounded-full px-4 text-[13px] text-fg-tertiary transition-colors cursor-text min-w-[140px]',
              )}
            >
              <IconMagnifer size={14} />
              <span>{common.searchInputPlaceholder}</span>
            </button>

            {/* Search icon (mobile / tablet) */}
            <button
              type="button"
              onClick={() => setSpotlightOpen(true)}
              aria-label={common.search}
              aria-keyshortcuts="Control+k"
              className={cn(
                'flex',
                ICON_PILL,
                HOVER_SUBTLE,
                'lg:hidden text-fg-tertiary transition-colors',
              )}
            >
              <IconMagnifer size={16} />
            </button>

            {/* Settings */}
            <Link
              href="/settings"
              className={cn(
                'flex',
                ICON_PILL,
                HOVER_SUBTLE,
                'text-fg-tertiary transition-colors hover:text-fg-secondary',
              )}
              aria-label={nav.settings}
            >
              <IconSettings size={18} />
            </Link>

            {/* User avatar */}
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
