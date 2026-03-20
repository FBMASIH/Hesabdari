import { ErrorBoundary } from '@hesabdari/ui';
import { ProductListPage } from '@/features/inventory';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import type { ProductDetailDto } from '@/features/inventory';

export default async function ProductsPage() {
  let initialData: PaginatedResponse<ProductDetailDto> | undefined;
  try {
    const { client, orgId } = await createServerClient();
    initialData = await client.get(serverOrgPath(orgId, '/products'), {
      page: '1',
      pageSize: '10',
    });
  } catch {
    // Server fetch failed — client handles it
  }

  return (
    <ErrorBoundary>
      <ProductListPage initialData={initialData} />
    </ErrorBoundary>
  );
}
