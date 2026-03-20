import { ErrorBoundary } from '@hesabdari/ui';
import { WarehouseListPage } from '@/features/inventory';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import type { WarehouseDto } from '@/features/inventory';

export default async function WarehousesPage() {
  let initialData: PaginatedResponse<WarehouseDto> | undefined;
  try {
    const { client, orgId } = await createServerClient();
    initialData = await client.get(serverOrgPath(orgId, '/warehouses'), {
      page: '1',
      pageSize: '10',
    });
  } catch {
    // Server fetch failed — client handles it
  }

  return (
    <ErrorBoundary>
      <WarehouseListPage initialData={initialData} />
    </ErrorBoundary>
  );
}
