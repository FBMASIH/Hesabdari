import { ErrorBoundary } from '@hesabdari/ui';
import { CashboxListPage } from '@/features/treasury';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import type { CashboxDto } from '@/features/treasury';

export default async function CashboxesPage() {
  let initialData: PaginatedResponse<CashboxDto> | undefined;
  try {
    const { client, orgId } = await createServerClient();
    initialData = await client.get(serverOrgPath(orgId, '/cashboxes'), {
      page: '1',
      pageSize: '10',
    });
  } catch {
    // Server fetch failed — client handles it
  }

  return (
    <ErrorBoundary>
      <CashboxListPage initialData={initialData} />
    </ErrorBoundary>
  );
}
