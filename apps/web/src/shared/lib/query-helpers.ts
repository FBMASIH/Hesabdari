/**
 * Shared TanStack Query helpers.
 *
 * - Paginated response type matching API shape
 * - Organization ID from auth store
 * - Query key factory pattern
 */

import { useAuthStore } from '@/shared/hooks/use-auth';
import { t } from '@/shared/lib/i18n';

/** Standard paginated API response shape. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Get the active organization ID from the auth store.
 *
 * In production, throws if no org is selected.
 * In development, falls back to the seeded org to enable testing
 * before the profile/membership API is fully wired.
 */
export function getOrgId(): string {
  const orgId = useAuthStore.getState().organizationId;
  if (orgId) return orgId;

  // Development fallback — seeded org from db:seed
  if (process.env.NODE_ENV === 'development') {
    return '00000000-0000-0000-0000-000000000001';
  }

  throw new Error(t('messages').noOrgSelected);
}

/** Build org-scoped API path. */
export function orgPath(path: string): string {
  return `/api/v1/organizations/${getOrgId()}${path}`;
}

/** Convert query params object to Record<string, string> for apiClient.get(). */
export function toQueryParams(params: object): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = String(value);
    }
  }
  return result;
}
