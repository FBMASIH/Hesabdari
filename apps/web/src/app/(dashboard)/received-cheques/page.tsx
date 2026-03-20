import { ErrorBoundary } from '@hesabdari/ui';
import { ReceivedChequeListPage } from '@/features/treasury';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import type { ReceivedChequeDto } from '@/features/treasury';

export default async function ReceivedChequesPage() {
  let initialData: PaginatedResponse<ReceivedChequeDto> | undefined;
  try {
    const { client, orgId } = await createServerClient();
    initialData = await client.get(serverOrgPath(orgId, '/received-cheques'), {
      page: '1',
      pageSize: '10',
    });
  } catch {
    // Server fetch failed — client handles it
  }

  return (
    <ErrorBoundary>
      <ReceivedChequeListPage initialData={initialData} />
    </ErrorBoundary>
  );
}
