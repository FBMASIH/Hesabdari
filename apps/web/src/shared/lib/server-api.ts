import { cookies } from 'next/headers';
import { ApiClient } from '@hesabdari/api-client';

/**
 * Server-side API client for data fetching in Server Components.
 *
 * Reads auth tokens from cookies (synced by useAuthStore on the client).
 * Calls the backend directly since Server Components can't use the
 * Next.js rewrite proxy (rewrites only apply to incoming HTTP requests).
 */

const API_BASE = process.env.API_BACKEND_URL ?? 'http://localhost:4000';

export async function createServerClient(): Promise<{
  client: ApiClient;
  orgId: string | null;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value ?? null;
  const orgId = cookieStore.get('organization_id')?.value ?? null;

  const client = new ApiClient({
    baseUrl: API_BASE,
    getAccessToken: () => accessToken,
  });

  return { client, orgId };
}

/** Build org-scoped API path for server-side fetching. */
export function serverOrgPath(orgId: string | null, path: string): string {
  const id =
    orgId ??
    (process.env.NODE_ENV === 'development' ? '00000000-0000-0000-0000-000000000001' : null);
  if (!id) throw new Error('No organization selected');
  return `/api/v1/organizations/${id}${path}`;
}
