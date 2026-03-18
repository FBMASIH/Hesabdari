'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cn, IconBuildings, IconChevronDown } from '@hesabdari/ui';
import { apiClient } from '@/shared/lib/api';
import { useAuthStore } from '@/shared/hooks/use-auth';

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
        // Organization load failed — non-blocking, OrgSelector handles empty state
      });
  }, [isAuthenticated, organizationId, setOrganizationId]);

  const currentOrg = orgs.find((o) => o.id === organizationId);
  const displayName = currentOrg?.name ?? 'سازمان';

  if (orgs.length <= 1) {
    return (
      <span className="text-sm text-fg-secondary">{displayName}</span>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="glass-surface flex h-9 items-center gap-2 rounded-xl px-4 text-sm text-fg-secondary hover:text-fg-primary"
      >
        <IconBuildings size={16} />
        {displayName}
        <IconChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute z-modal mt-1.5 w-56 rounded-xl border-[0.5px] border-border-primary bg-bg-secondary/95 shadow-lg backdrop-blur-xl">
          {orgs.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => {
                setOrganizationId(org.id);
                setOpen(false);
                // Invalidate all queries to refetch with new org context
                queryClient.invalidateQueries();
              }}
              className={cn('flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-bg-tertiary/50',
                org.id === organizationId ? 'text-primary-default font-medium' : 'text-fg-primary'
              )}
            >
              <span>{org.name}</span>
              <span className="text-xs text-fg-tertiary">{org.role}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
