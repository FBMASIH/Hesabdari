'use client';

import { IconMagnifer, IconCalendar, IconLogout } from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { jalaliMonthYear, jalaliCurrentFiscalYear } from '@/shared/lib/date';
import { useAuthStore } from '@/shared/hooks/use-auth';
import { OrgSelector } from './org-selector';

const common = t('common');
const nav = t('nav');

export function UtilityBar() {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <header className="mx-auto flex w-full max-w-[1440px] items-center gap-5 px-6 py-4">
      {/* Brand — right side in RTL */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-deep text-sm font-bold text-primary-fg shadow-[0_1px_4px_rgba(74,141,184,0.3)]">
          T
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-fg-primary">{common.brandName}</span>
          <span className="text-xs text-fg-tertiary">{jalaliCurrentFiscalYear()}</span>
        </div>
      </div>

      {/* Search — centered */}
      <div className="relative flex-1 max-w-xl mx-auto">
        <div className="glass-surface flex h-10 items-center rounded-xl px-4">
          <IconMagnifer size={16} className="text-fg-tertiary flex-shrink-0" />
          <input
            type="text"
            placeholder={common.searchPlaceholder}
            aria-label={common.search}
            className="flex-1 bg-transparent px-3 text-sm text-fg-primary placeholder:text-fg-tertiary focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center rounded-md border border-border-secondary bg-bg-tertiary/40 px-1.5 text-[10px] text-fg-tertiary">
            ⌘K
          </kbd>
        </div>
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
          onClick={handleLogout}
          className="glass-surface flex h-9 items-center gap-2 rounded-xl px-4 text-sm text-fg-secondary hover:text-danger-default"
          title={nav.logout}
        >
          <IconLogout size={16} />
          <span className="hidden sm:inline">{nav.logout}</span>
        </button>
      </div>
    </header>
  );
}
