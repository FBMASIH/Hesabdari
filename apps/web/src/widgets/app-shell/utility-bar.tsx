'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { IconMagnifer, IconCalendar, IconLogout, IconSun, IconMoon } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { jalaliMonthYear, jalaliCurrentFiscalYear } from '@/shared/lib/date';
import { useAuthStore } from '@/shared/hooks/use-auth';
import { useTheme } from '@/providers/theme-provider';
import { OrgSelector } from './org-selector';
import { SpotlightSearch, SHORTCUT_LABEL } from './spotlight-search';

const common = t('common');
const nav = t('nav');
const s = t('settings');

export function UtilityBar() {
  const { logout } = useAuthStore();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

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

  function handleLogout(): void {
    try {
      void logout();
      queryClient.clear();
    } catch {
      // Cleanup may fail — still redirect to login
    }
    router.push('/login');
  }

  return (
    <>
      <header className="mx-auto flex w-full max-w-[1440px] items-center gap-5 px-6 pb-3 pt-5">
        {/* Brand — right side in RTL */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-deep text-sm font-bold text-primary-fg shadow-brand-ring">
            T
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-fg-primary">{common.brandName}</span>
            <span className="text-xs text-fg-tertiary">{jalaliCurrentFiscalYear()}</span>
          </div>
        </div>

        {/* Search trigger — centered */}
        <div className="relative flex-1 max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => setSpotlightOpen(true)}
            aria-label={common.search}
            aria-keyshortcuts="Control+k"
            className="glass-surface flex h-10 w-full items-center rounded-xl px-4 text-start"
          >
            <IconMagnifer size={16} className="text-fg-tertiary flex-shrink-0" />
            <span className="flex-1 px-3 text-sm text-fg-tertiary">{common.searchPlaceholder}</span>
            <kbd
              className="hidden sm:inline-flex h-5 items-center rounded-md border border-border-secondary bg-bg-tertiary/40 px-1.5 text-[10px] text-fg-tertiary"
              aria-hidden="true"
              suppressHydrationWarning
            >
              {SHORTCUT_LABEL}
            </kbd>
          </button>
        </div>

        {/* Selectors — left side in RTL */}
        <div className="flex items-center gap-3.5">
          <OrgSelector />

          <div className="glass-surface-static flex h-9 items-center gap-2 rounded-xl px-4 text-sm text-fg-secondary">
            <IconCalendar size={14} />
            {jalaliMonthYear()}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="glass-surface flex h-9 w-9 items-center justify-center rounded-xl text-fg-secondary transition-colors hover:text-fg-primary"
            title={
              mounted ? (resolvedTheme === 'dark' ? s.lightTheme : s.darkTheme) : s.toggleTheme
            }
            aria-label={
              mounted ? (resolvedTheme === 'dark' ? s.lightTheme : s.darkTheme) : s.toggleTheme
            }
          >
            {mounted ? (
              resolvedTheme === 'dark' ? (
                <IconSun size={16} />
              ) : (
                <IconMoon size={16} />
              )
            ) : (
              <span className="inline-block h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="glass-surface flex h-9 items-center gap-2 rounded-xl px-4 text-sm text-fg-secondary hover:text-danger-default"
            title={nav.logout}
            aria-label={nav.logout}
          >
            <IconLogout size={16} />
            <span className="hidden sm:inline">{nav.logout}</span>
          </button>
        </div>
      </header>

      <SpotlightSearch open={spotlightOpen} onOpenChange={setSpotlightOpen} />
    </>
  );
}
