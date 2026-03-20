import { ErrorBoundary } from '@hesabdari/ui';
import { PaidChequeListPage } from '@/features/treasury';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import type { PaidChequeDto } from '@/features/treasury';

export default async function PaidChequesPage() {
  let initialData: PaginatedResponse<PaidChequeDto> | undefined;
  try {
    const { client, orgId } = await createServerClient();
    initialData = await client.get(serverOrgPath(orgId, '/paid-cheques'), {
      page: '1',
      pageSize: '10',
    });
  } catch {
    // Server fetch failed — client handles it
  }

  return (
    <ErrorBoundary>
      <PaidChequeListPage initialData={initialData} />
    </ErrorBoundary>
  );
}
