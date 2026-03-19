'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cn, IconBuildings, IconChevronDown, IconDangerTriangle } from '@hesabdari/ui';
import { apiClient } from '@/shared/lib/api';
import { useAuthStore } from '@/shared/hooks/use-auth';
import { DROPDOWN_PANEL } from '@/shared/styles';

interface UserOrg {
  id: string;
  name: string;
  slug: string;
  role: string;
}

/**
 * Organization selector for the utility bar.
 * Fetches user's orgs from GET /api/v1/auth/profile on mount.
 * Single org: shows static name. Multiple orgs: shows dropdown.
 */
export function OrgSelector() {
  const { organizationId, setOrganizationId, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [orgs, setOrgs] = useState<UserOrg[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const hasFetched = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  useEffect(() => {
    if (!isAuthenticated || hasFetched.current) return;
    hasFetched.current = true;
    setError(false);
    apiClient
      .get<{ organizations: UserOrg[] }>('/api/v1/auth/profile')
      .then((profile) => {
        setOrgs(profile.organizations);
        if (!organizationId && profile.organizations.length > 0) {
          const firstOrg = profile.organizations[0];
          if (firstOrg) setOrganizationId(firstOrg.id);
        }
      })
      .catch(() => {
        setError(true);
      });
  }, [isAuthenticated, organizationId, setOrganizationId, retryCount]);

  const currentOrg = orgs.find((o) => o.id === organizationId);
  const displayName = currentOrg?.name ?? 'سازمان';

  if (error && orgs.length === 0) {
    return (
      <button
        type="button"
        onClick={() => {
          hasFetched.current = false;
          setRetryCount((c) => c + 1);
        }}
        className="glass-surface-static flex h-9 items-center gap-2 rounded-xl px-3 text-sm text-fg-tertiary hover:text-fg-secondary transition-colors"
        title="خطا در بارگذاری — کلیک برای تلاش مجدد"
        aria-label="خطا در بارگذاری — کلیک برای تلاش مجدد"
      >
        <IconDangerTriangle size={14} className="text-warning-default" />
        <span className="hidden sm:inline">سازمان</span>
      </button>
    );
  }

  if (orgs.length <= 1) {
    return <span className="text-sm text-fg-secondary">{displayName}</span>;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="انتخاب سازمان"
        className="glass-surface flex h-9 items-center gap-2 rounded-xl px-4 text-sm text-fg-secondary hover:text-fg-primary"
      >
        <IconBuildings size={16} />
        {displayName}
        <IconChevronDown size={14} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="انتخاب سازمان"
          className={cn('absolute z-dropdown mt-1.5 w-56', DROPDOWN_PANEL)}
        >
          {orgs.map((org) => (
            <div
              key={org.id}
              role="option"
              aria-selected={org.id === organizationId}
              tabIndex={-1}
              onClick={() => {
                setOrganizationId(org.id);
                setOpen(false);
                queryClient.invalidateQueries();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOrganizationId(org.id);
                  setOpen(false);
                  queryClient.invalidateQueries();
                }
              }}
              className={cn(
                'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-bg-tertiary/50',
                org.id === organizationId ? 'text-fg-primary font-medium' : 'text-fg-secondary',
              )}
            >
              <span>{org.name}</span>
              <span className="text-xs text-fg-tertiary">{org.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
