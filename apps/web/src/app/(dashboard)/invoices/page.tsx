import { ErrorBoundary } from '@hesabdari/ui';
import { InvoiceListPage } from '@/features/invoices';
import { createServerClient, serverOrgPath } from '@/shared/lib/server-api';
import type { PaginatedResponse } from '@/shared/lib/query-helpers';
import type { InvoiceDto } from '@/features/invoices';

export default async function InvoicesPage() {
  let initialData: PaginatedResponse<InvoiceDto> | undefined;
  try {
    const { client, orgId } = await createServerClient();
    initialData = await client.get(serverOrgPath(orgId, '/invoices'), {
      page: '1',
      pageSize: '10',
    });
  } catch {
    // Server fetch failed — client handles it
  }

  return (
    <ErrorBoundary>
      <InvoiceListPage initialData={initialData} />
    </ErrorBoundary>
  );
}
