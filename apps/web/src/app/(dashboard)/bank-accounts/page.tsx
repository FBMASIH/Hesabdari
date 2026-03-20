import { ErrorBoundary } from '@hesabdari/ui';
import { BankAccountListPage } from '@/features/treasury';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import type { BankAccountDto } from '@/features/treasury';

export default async function BankAccountsPage() {
  let initialData: PaginatedResponse<BankAccountDto> | undefined;
  try {
    const { client, orgId } = await createServerClient();
    initialData = await client.get(serverOrgPath(orgId, '/bank-accounts'), {
      page: '1',
      pageSize: '10',
    });
  } catch {
    // Server fetch failed — client handles it
  }

  return (
    <ErrorBoundary>
      <BankAccountListPage initialData={initialData} />
    </ErrorBoundary>
  );
}
