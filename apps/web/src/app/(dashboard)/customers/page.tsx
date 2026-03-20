import { ErrorBoundary } from '@hesabdari/ui';
import { CustomerListPage } from '@/features/customers';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import type { CustomerDto } from '@/features/customers';

export default async function CustomersPage() {
  let initialData: PaginatedResponse<CustomerDto> | undefined;
  try {
    const { client, orgId } = await createServerClient();
    initialData = await client.get(serverOrgPath(orgId, '/customers'), {
      page: '1',
      pageSize: '10',
    });
  } catch {
    // Server fetch failed (token expired, API down) — client handles it
  }

  return (
    <ErrorBoundary>
      <CustomerListPage initialData={initialData} />
    </ErrorBoundary>
  );
}
