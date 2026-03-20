import { ErrorBoundary } from '@hesabdari/ui';
import { AccountTreePage } from '@/features/accounting';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { AccountDto } from '@/features/shared/hooks/use-accounts';

export default async function AccountingPage() {
  let initialData: AccountDto[] | undefined;
  try {
    const { client, orgId } = await createServerClient();
    initialData = await client.get(serverOrgPath(orgId, '/accounts'));
  } catch {
    // Server fetch failed — client handles it
  }

  return (
    <ErrorBoundary>
      <AccountTreePage initialData={initialData} />
    </ErrorBoundary>
  );
}
