'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  cn,
  IconUser,
  IconBuildings,
  IconLogout,
  IconCalendar,
  IconCheck,
  IconDangerTriangle,
} from '@hesabdari/ui';
import { t } from '@/shared/lib/i18n';
import { jalaliMonthYear, jalaliCurrentFiscalYear } from '@/shared/lib/date';
import { THEME_OPTIONS } from '@/shared/lib/theme';
import { useAuthStore } from '@/shared/hooks/use-auth';
import { useDismiss } from '@/shared/hooks/use-dismiss';
import { useTheme } from '@/providers/theme-provider';
import { apiClient } from '@/shared/lib/api';
import { DROPDOWN_PANEL } from '@/shared/styles';

const nav = t('nav');
const common = t('common');
const s = t('settings');

interface UserOrg {
  id: string;
  name: string;
  slug: string;
  role: string;
}

/** Thin horizontal rule used between dropdown sections. */
function MenuDivider() {
  return <div className="mx-2 border-t border-border-secondary" />;
}

/**
 * Unified user menu -- consolidates org selector, theme toggle,
 * calendar display, and logout into a single avatar dropdown.
 */
export function UserMenu() {
  const { logout, organizationId, setOrganizationId, isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [orgs, setOrgs] = useState<UserOrg[]>([]);
  const [orgError, setOrgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const hasFetched = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useDismiss(menuRef, open, close);

  // Fetch orgs — cleanup prevents state updates after unmount
  useEffect(() => {
    if (!isAuthenticated || hasFetched.current) return;
    hasFetched.current = true;
    setOrgError(false);
    let cancelled = false;
    apiClient
      .get<{ organizations: UserOrg[] }>('/api/v1/auth/profile')
      .then((profile) => {
        if (cancelled) return;
        setOrgs(profile.organizations);
        if (!organizationId && profile.organizations.length > 0) {
          const firstOrg = profile.organizations[0];
          if (firstOrg) setOrganizationId(firstOrg.id);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setOrgError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, retryCount]);

  const selectOrg = useCallback(
    (orgId: string) => {
      setOrganizationId(orgId);
      queryClient.invalidateQueries();
    },
    [setOrganizationId, queryClient],
  );

  async function handleLogout(): Promise<void> {
    queryClient.clear();
    await logout().catch(() => {
      /* best-effort server session kill */
    });
    router.push('/login');
  }

  const currentOrg = orgs.find((o) => o.id === organizationId);

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="user-menu-popup"
        aria-label={nav.profile}
        className={cn(
          'flex h-[38px] w-[38px] items-center justify-center rounded-full transition-all duration-200',
          'bg-brand-deep/10 text-brand-deep hover:bg-brand-deep/20',
          open && 'ring-2 ring-brand-deep/25',
        )}
      >
        <IconUser size={16} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          id="user-menu-popup"
          role="menu"
          aria-label={nav.account}
          className={cn(
            'absolute end-0 top-full z-dropdown mt-2 w-64 animate-dropdown',
            DROPDOWN_PANEL,
          )}
        >
          {/* Organization section */}
          <div className="px-3 pb-2 pt-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-deep text-xs font-bold text-primary-fg shadow-brand-ring">
                T
              </div>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-semibold text-fg-primary">
                  {currentOrg?.name ?? common.brandName}
                </span>
                <span className="text-2xs text-fg-tertiary">{jalaliCurrentFiscalYear()}</span>
              </div>
            </div>
          </div>

          {/* Org switcher -- only if multiple orgs */}
          {orgs.length > 1 && (
            <>
              <MenuDivider />
              <div className="px-1 py-1">
                <span className="px-2 py-1 text-2xs font-medium text-fg-tertiary">
                  {nav.selectOrg}
                </span>
                {orgs.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    role="menuitem"
                    onClick={() => selectOrg(org.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-bg-tertiary/50',
                      org.id === organizationId
                        ? 'text-fg-primary font-medium'
                        : 'text-fg-secondary',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <IconBuildings size={14} className="text-fg-tertiary" />
                      <span>{org.name}</span>
                    </div>
                    {org.id === organizationId && (
                      <IconCheck size={14} className="text-brand-deep" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Org error state */}
          {orgError && orgs.length === 0 && (
            <>
              <MenuDivider />
              <div className="px-1 py-1">
                <button
                  type="button"
                  onClick={() => {
                    hasFetched.current = false;
                    setRetryCount((c) => c + 1);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-warning-default hover:bg-bg-tertiary/50"
                >
                  <IconDangerTriangle size={14} />
                  {nav.orgLoadError}
                </button>
              </div>
            </>
          )}

          <MenuDivider />

          {/* Info row -- date & calendar */}
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-fg-secondary">
            <IconCalendar size={14} className="text-fg-tertiary" />
            <span>{jalaliMonthYear()}</span>
          </div>

          <MenuDivider />

          {/* Theme selector */}
          <div className="px-1 py-1">
            <span className="px-2 py-1 text-2xs font-medium text-fg-tertiary">{s.theme}</span>
            <div className="flex gap-1 px-1.5 py-1">
              {THEME_OPTIONS.map((opt) => {
                const isActive = theme === opt.key;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="menuitem"
                    onClick={() => setTheme(opt.key)}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-primary-subtle text-primary-default'
                        : 'text-fg-tertiary hover:text-fg-secondary hover:bg-bg-tertiary/50',
                    )}
                  >
                    {Icon && <Icon size={14} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <MenuDivider />

          {/* Logout */}
          <div className="px-1 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-danger-default transition-colors hover:bg-danger-subtle"
            >
              <IconLogout size={14} />
              {nav.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
