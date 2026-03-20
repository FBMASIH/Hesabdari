import { ErrorBoundary } from '@hesabdari/ui';
import { VendorListPage } from '@/features/vendors';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import type { VendorDto } from '@/features/vendors';

export default async function VendorsPage() {
  let initialData: PaginatedResponse<VendorDto> | undefined;
  try {
    const { client, orgId } = await createServerClient();
    initialData = await client.get(serverOrgPath(orgId, '/vendors'), {
      page: '1',
      pageSize: '10',
    });
  } catch {
    // Server fetch failed — client handles it
  }

  return (
    <ErrorBoundary>
      <VendorListPage initialData={initialData} />
    </ErrorBoundary>
  );
}
